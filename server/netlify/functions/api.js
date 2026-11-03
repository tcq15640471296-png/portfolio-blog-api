/**
 * Deployment entry point for Netlify Functions (AWS Lambda runtime).
 *
 * The same Express app that `server.js` starts locally is wrapped with
 * `serverless-http`, so every route keeps working unchanged. The only extra
 * concern is the database connection: a long-running server connects once at
 * boot, while a function must reuse a cached connection between invocations.
 *
 * Local development and the tests keep using `server.js` / `npm test`.
 */
const serverless = require('serverless-http');

const connectDB = require('../../config/db');
const app = require('../../app');

let connectionPromise = null;

/** Connect at most once per warm container; reset on failure so we can retry. */
const ensureDatabase = () => {
  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
};

const handler = serverless(app);

exports.handler = async (event, context) => {
  // Do not wait for the event loop to drain (keeps MongoDB's socket pool open
  // between invocations instead of blocking the response).
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await ensureDatabase();
  } catch (error) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      }),
    };
  }

  return handler(event, context);
};
