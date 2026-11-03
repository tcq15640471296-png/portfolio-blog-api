/**
 * Seed script — fills the connected database with demo content so that the
 * portfolio and the blog are not empty when the project is demonstrated.
 *
 * Usage:  npm run seed
 * WARNING: it deletes the existing Users / Projects / BlogPosts / Comments / Messages.
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const BlogPost = require('./models/BlogPost');
const Comment = require('./models/Comment');
const Message = require('./models/Message');

const ADMIN = {
  username: process.env.SEED_USERNAME || 'admin',
  // The owner's email / password used by the Admin Dashboard login.
  // Override them with SEED_EMAIL / SEED_PASSWORD in .env if you prefer.
  email: process.env.SEED_EMAIL || '1310708365@qq.com',
  password: process.env.SEED_PASSWORD || 'tcq20060525',
  headline: 'Full-Stack Developer · Web Data Management and Application',
  bio: 'I build data-driven web applications with Node.js, Express, MongoDB and React. This portfolio is my capstone project for the Web Data Management and Application course.',
  skills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'REST APIs', 'JWT Auth', 'Tailwind CSS', 'Git'],
  social: {
    github: 'https://github.com/your-username',
    linkedin: 'https://www.linkedin.com/in/your-profile',
  },
};

const projects = [
  {
    title: 'Portfolio & Blog Platform',
    description:
      'Full-stack portfolio and blog application: an Express + MongoDB REST API with JWT authentication, consumed by a React single page application with a protected admin dashboard. Deployed to Render (API) and Vercel (client).',
    imageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1200',
    repoUrl: 'https://github.com/your-username/capstone-project',
    liveUrl: 'https://your-portfolio.vercel.app',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Tailwind CSS'],
    featured: true,
  },
  {
    title: 'Campus Library Management System',
    description:
      'Relational database design for a university library: borrowing, returning, fines and inventory, implemented with MySQL and a reporting dashboard.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200',
    repoUrl: 'https://github.com/your-username/library-system',
    liveUrl: '',
    techStack: ['MySQL', 'SQL', 'Database Design'],
    featured: false,
  },
  {
    title: 'Data Cleaning & Visualisation Notebook',
    description:
      'Pandas workflow that cleans a 9 MB public police incident dataset and visualises trends with Matplotlib — an exercise in data quality checks and reproducible analysis.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
    repoUrl: 'https://github.com/your-username/police-data-analysis',
    liveUrl: '',
    techStack: ['Python', 'Pandas', 'Matplotlib', 'Jupyter'],
    featured: false,
  },
];

const posts = [
  {
    title: 'Why I chose the MVC pattern for my Express API',
    content:
      'Splitting the back-end into models, controllers and routes keeps the code readable and testable. Models own the data shape and validation, controllers own the request/response logic, and routes only map URLs to controllers.\n\nThe biggest practical win is the middleware layer: `protect` verifies the JWT once and attaches `req.user`, so every protected controller can trust that a user exists. The same idea applies to the authorization factory, which loads the document and checks ownership before the controller runs.',
    tags: ['Express', 'Architecture', 'Node.js'],
    coverImageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200',
  },
  {
    title: 'JWT authentication, step by step',
    content:
      'Registration hashes the password with bcrypt inside a Mongoose pre-save hook, so the plain text password never reaches the database. Login compares the submitted password with the stored hash and signs a token containing the user id.\n\nThe client stores that token in localStorage and an Axios interceptor adds it to every request as `Authorization: Bearer <token>`. On the server, the `protect` middleware verifies the signature and looks the user up again — never trust a payload you have not verified.',
    tags: ['JWT', 'Security', 'Authentication'],
    coverImageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200',
  },
];

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    BlogPost.deleteMany({}),
    Comment.deleteMany({}),
    Message.deleteMany({}),
  ]);

  const admin = await User.create(ADMIN);

  const createdProjects = await Project.insertMany(
    projects.map((p) => ({ ...p, user: admin._id }))
  );

  const createdPosts = [];
  for (const post of posts) {
    // create() one by one so the timestamps differ slightly
    createdPosts.push(await BlogPost.create({ ...post, author: admin._id }));
  }

  await Comment.create({
    body: 'Great explanation — the middleware factory idea is really clean.',
    author: admin._id,
    post: createdPosts[0]._id,
  });

  await Message.create({
    name: 'Recruiter Demo',
    email: 'recruiter@example.com',
    message: 'Hello! I saw your portfolio and would like to talk about an internship.',
  });

  console.log('Seed completed:');
  console.log(`  users:    ${await User.countDocuments()}`);
  console.log(`  projects: ${createdProjects.length}`);
  console.log(`  posts:    ${createdPosts.length}`);
  console.log(`  comments: ${await Comment.countDocuments()}`);
  console.log(`  messages: ${await Message.countDocuments()}`);
  console.log('\nAdmin credentials:');
  console.log(`  email:    ${ADMIN.email}`);
  console.log(`  password: ${ADMIN.password}`);
};

module.exports = { seedDatabase: run, ADMIN };

// When this file is executed directly (`npm run seed`) the connection is closed
// afterwards; when it is imported (see dev-memory.js) the caller stays connected.
if (require.main === module) {
  run()
    .catch((error) => {
      console.error(`Seed failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
}
