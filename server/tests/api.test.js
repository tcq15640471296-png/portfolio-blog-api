/**
 * End-to-end integration tests for the Portfolio & Blog API.
 *
 * Run with:  npm test
 *
 * The suite boots an in-memory MongoDB instance (no Atlas account required)
 * and exercises every endpoint declared in the capstone specification:
 * registration, login, JWT protection, ownership authorization, project CRUD,
 * blog CRUD, comments and the contact form.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_for_integration_tests';
process.env.JWT_EXPIRE = '1h';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const User = require('../models/User');
const Comment = require('../models/Comment');

let mongo;
let api;

const userOne = { username: 'alice', email: 'alice@example.com', password: 'secret123' };
const userTwo = { username: 'bob', email: 'bob@example.com', password: 'secret123' };

let tokenOne;
let tokenTwo;
let projectId;
let postId;
let commentId;

test.before(async () => {
  // launchTimeout is generous because the very first run downloads the mongod binary.
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 120000 } });
  await mongoose.connect(mongo.getUri());
  api = request(app);
});

test.after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

test.beforeEach(async () => {
  await User.deleteMany({});
  await Comment.deleteMany({});
  await mongoose.connection.collection('projects').deleteMany({});
  await mongoose.connection.collection('blogposts').deleteMany({});
  await mongoose.connection.collection('messages').deleteMany({});
});

/* ------------------------------------------------------------------ */
/* 1. Authentication                                                   */
/* ------------------------------------------------------------------ */

test('POST /api/users/register creates a user, hashes the password and returns a JWT', async () => {
  const res = await api.post('/api/users/register').send(userOne);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.username, userOne.username);
  assert.ok(res.body.data.token, 'a JWT should be returned');
  assert.equal(res.body.data.password, undefined, 'the password must never be returned');

  const stored = await User.findOne({ email: userOne.email }).select('+password');
  assert.notEqual(stored.password, userOne.password, 'the password must be hashed with bcrypt');
  assert.match(stored.password, /^\$2[aby]\$/, 'bcrypt hash prefix expected');

  tokenOne = res.body.data.token;
});

test('POST /api/users/register rejects a password shorter than 6 characters', async () => {
  const res = await api
    .post('/api/users/register')
    .send({ username: 'shorty', email: 'shorty@example.com', password: '123' });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('POST /api/users/register rejects a duplicate email', async () => {
  await api.post('/api/users/register').send(userOne);
  const res = await api.post('/api/users/register').send({
    username: 'alice2',
    email: userOne.email,
    password: 'secret123',
  });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /already exists/i);
});

test('POST /api/users/login returns a JWT for valid credentials', async () => {
  await api.post('/api/users/register').send(userOne);
  const res = await api.post('/api/users/login').send({
    email: userOne.email,
    password: userOne.password,
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.data.token);
  tokenOne = res.body.data.token;
});

test('POST /api/users/login rejects a wrong password with 401', async () => {
  await api.post('/api/users/register').send(userOne);
  const res = await api
    .post('/api/users/login')
    .send({ email: userOne.email, password: 'wrong-password' });

  assert.equal(res.status, 401);
});

test('GET /api/users/me returns the logged-in user (protect middleware)', async () => {
  const reg = await api.post('/api/users/register').send(userOne);
  tokenOne = reg.body.data.token;

  const res = await api.get('/api/users/me').set('Authorization', `Bearer ${tokenOne}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.email, userOne.email);
});

test('profile: public read, protected update (skills parsed from a comma list)', async () => {
  const reg = await api.post('/api/users/register').send(userOne);
  tokenOne = reg.body.data.token;

  const anon = await api.get('/api/users/profile');
  assert.equal(anon.status, 200);
  assert.equal(anon.body.data.username, userOne.username);

  const anonymousWrite = await api.put('/api/users/profile').send({ bio: 'hack' });
  assert.equal(anonymousWrite.status, 401, 'the profile must only be writable by its owner');

  const updated = await api
    .put('/api/users/profile')
    .set('Authorization', `Bearer ${tokenOne}`)
    .send({ headline: 'Full-stack developer', skills: 'React, Node.js, MongoDB' });

  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body.data.skills, ['React', 'Node.js', 'MongoDB']);

  const after = await api.get('/api/users/profile');
  assert.equal(after.body.data.headline, 'Full-stack developer');
  assert.equal(after.body.data.skills.length, 3);
});

test('protect middleware rejects missing and invalid tokens with 401', async () => {
  const noToken = await api.post('/api/projects').send({ title: 'x', description: 'y' });
  assert.equal(noToken.status, 401);

  const badToken = await api
    .post('/api/projects')
    .set('Authorization', 'Bearer not.a.real.token')
    .send({ title: 'x', description: 'y' });
  assert.equal(badToken.status, 401);
  assert.match(badToken.body.message, /invalid/i);
});

/* ------------------------------------------------------------------ */
/* 2. Projects CRUD                                                     */
/* ------------------------------------------------------------------ */

test('projects: full public + protected CRUD lifecycle', async () => {
  const reg = await api.post('/api/users/register').send(userOne);
  tokenOne = reg.body.data.token;

  // CREATE (protected)
  const created = await api
    .post('/api/projects')
    .set('Authorization', `Bearer ${tokenOne}`)
    .send({ title: 'Capstone', description: 'Portfolio & blog app', techStack: ['React'] });

  assert.equal(created.status, 201);
  assert.ok(created.body.data.user, 'the project must reference the logged-in user');
  projectId = created.body.data._id;

  // READ all (public)
  const all = await api.get('/api/projects');
  assert.equal(all.status, 200);
  assert.equal(all.body.count, 1);
  assert.equal(all.body.data[0].user.username, userOne.username, 'user should be populated');

  // READ one (public)
  const one = await api.get(`/api/projects/${projectId}`);
  assert.equal(one.status, 200);
  assert.equal(one.body.data.title, 'Capstone');

  // UPDATE (protected)
  const updated = await api
    .put(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${tokenOne}`)
    .send({ title: 'Capstone v2' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.title, 'Capstone v2');

  // DELETE (protected)
  const deleted = await api
    .delete(`/api/projects/${projectId}`)
    .set('Authorization', `Bearer ${tokenOne}`);
  assert.equal(deleted.status, 200);

  const gone = await api.get(`/api/projects/${projectId}`);
  assert.equal(gone.status, 404);
});

test('projects: creating without a title triggers validation handling', async () => {
  const reg = await api.post('/api/users/register').send(userOne);
  tokenOne = reg.body.data.token;

  const res = await api
    .post('/api/projects')
    .set('Authorization', `Bearer ${tokenOne}`)
    .send({ description: 'no title' });

  assert.equal(res.status, 400);
});

/* ------------------------------------------------------------------ */
/* 3. Blog posts, ownership authorization and comments                  */
/* ------------------------------------------------------------------ */

test('blog: create, list, read (populated author + comments), comment', async () => {
  const a = await api.post('/api/users/register').send(userOne);
  const b = await api.post('/api/users/register').send(userTwo);
  tokenOne = a.body.data.token;
  tokenTwo = b.body.data.token;

  const created = await api
    .post('/api/blog')
    .set('Authorization', `Bearer ${tokenOne}`)
    .send({ title: 'Hello world', content: 'First post', tags: ['intro'] });
  assert.equal(created.status, 201);
  postId = created.body.data._id;

  const list = await api.get('/api/blog');
  assert.equal(list.status, 200);
  assert.equal(list.body.data[0].author.username, userOne.username, 'author must be populated');

  // Second user comments (protected)
  const commented = await api
    .post(`/api/blog/${postId}/comments`)
    .set('Authorization', `Bearer ${tokenTwo}`)
    .send({ body: 'Nice write-up!' });
  assert.equal(commented.status, 201);
  assert.equal(commented.body.data.author.username, userTwo.username);
  commentId = commented.body.data._id;

  // Public comment list for the post
  const comments = await api.get(`/api/blog/${postId}/comments`);
  assert.equal(comments.status, 200);
  assert.equal(comments.body.count, 1);

  // Detail endpoint returns the post with its comments
  const detail = await api.get(`/api/blog/${postId}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.author.username, userOne.username);
  assert.equal(detail.body.data.comments.length, 1);
  assert.equal(detail.body.data.comments[0].author.username, userTwo.username);

  // Commenting without a token is rejected
  const anonymous = await api.post(`/api/blog/${postId}/comments`).send({ body: 'spam' });
  assert.equal(anonymous.status, 401);
});

test('blog: only the author can update or delete a post (403 otherwise)', async () => {
  const a = await api.post('/api/users/register').send(userOne);
  const b = await api.post('/api/users/register').send(userTwo);
  tokenOne = a.body.data.token;
  tokenTwo = b.body.data.token;

  const created = await api
    .post('/api/blog')
    .set('Authorization', `Bearer ${tokenOne}`)
    .send({ title: 'Ownership', content: 'Only alice owns this' });
  postId = created.body.data._id;

  const forbiddenUpdate = await api
    .put(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${tokenTwo}`)
    .send({ title: 'hijacked' });
  assert.equal(forbiddenUpdate.status, 403, 'a non-author must not update the post');

  const forbiddenDelete = await api
    .delete(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${tokenTwo}`);
  assert.equal(forbiddenDelete.status, 403, 'a non-author must not delete the post');

  const okUpdate = await api
    .put(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${tokenOne}`)
    .send({ title: 'Updated by the author' });
  assert.equal(okUpdate.status, 200);
  assert.equal(okUpdate.body.data.title, 'Updated by the author');

  const okDelete = await api
    .delete(`/api/blog/${postId}`)
    .set('Authorization', `Bearer ${tokenOne}`);
  assert.equal(okDelete.status, 200);

  assert.equal(await Comment.countDocuments({ post: postId }), 0, 'comments cascade on delete');
});

/* ------------------------------------------------------------------ */
/* 4. Contact / messages                                                */
/* ------------------------------------------------------------------ */

test('contact: public POST saves a message and the admin can list it', async () => {
  const sent = await api.post('/api/contact').send({
    name: 'Visitor',
    email: 'visitor@example.com',
    message: 'Hello, I like your portfolio!',
  });

  assert.equal(sent.status, 201);
  assert.equal(sent.body.success, true);

  const anonymous = await api.get('/api/contact');
  assert.equal(anonymous.status, 401, 'the inbox must be protected');

  const reg = await api.post('/api/users/register').send(userOne);
  tokenOne = reg.body.data.token;

  const inbox = await api.get('/api/contact').set('Authorization', `Bearer ${tokenOne}`);
  assert.equal(inbox.status, 200);
  assert.equal(inbox.body.count, 1);
  assert.equal(inbox.body.data[0].message, 'Hello, I like your portfolio!');
});

test('contact: missing fields produce a 400', async () => {
  const res = await api.post('/api/contact').send({ name: 'No email' });
  assert.equal(res.status, 400);
});

/* ------------------------------------------------------------------ */
/* 5. Security headers & central error handling                         */
/* ------------------------------------------------------------------ */

test('helmet adds security headers', async () => {
  const res = await api.get('/api/health');
  assert.equal(res.status, 200);
  assert.ok(res.headers['x-dns-prefetch-control'], 'helmet header expected');
  assert.ok(res.headers['x-content-type-options']);
});

test('unknown routes and cast errors return consistent JSON errors', async () => {
  const unknown = await api.get('/api/does-not-exist');
  assert.equal(unknown.status, 404);
  assert.equal(unknown.body.success, false);
  assert.ok(unknown.body.message);

  const cast = await api.get('/api/projects/123-not-an-objectid');
  assert.equal(cast.status, 404);
  assert.equal(cast.body.success, false);
});
