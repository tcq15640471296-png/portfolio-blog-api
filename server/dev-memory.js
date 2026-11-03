/**
 * Run the API against a throw-away in-memory MongoDB instance, without a
 * MongoDB Atlas account. Handy for a quick demo, for the viva, or for grading
 * the project offline.
 *
 * Usage:  npm run dev:memory      -> http://localhost:5000
 *
 * The first run downloads a MongoDB binary (~50-80 MB) into a local cache.
 * The data disappears when the process stops. Requires MONGODB_URI to be unset
 * or it will be overridden.
 */
require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const app = require('./app');
const connectDB = require('./config/db');
const { seedDatabase } = require('./seed');

const PORT = process.env.PORT || 5000;

const start = async () => {
  console.log('Starting an in-memory MongoDB instance…');
  const mongo = await MongoMemoryServer.create({
    instance: { launchTimeout: 120000 }, // generous: the binary may still be downloading
  });

  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'in_memory_demo_secret';

  await connectDB();
  await seedDatabase();

  const server = app.listen(PORT, () => {
    console.log(`\nAPI (in-memory database) listening on http://localhost:${PORT}`);
    console.log(`Health check:  http://localhost:${PORT}/api/health`);
  });

  const shutdown = async () => {
    console.log('\nShutting down…');
    server.close();
    await mongoose.connection.close();
    await mongo.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start().catch((error) => {
  console.error(`Could not start the in-memory demo server: ${error.message}`);
  process.exit(1);
});
