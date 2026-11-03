/**
 * Deployment entry point for serverless hosting (Vercel Node.js runtime).
 *
 * The very same Express app that `server.js` starts locally is exported here.
 * The difference is the database connection: a long-running server connects
 * once at boot, while a serverless function must (re)use a cached connection
 * across warm invocations.
 *
 * Local development and the tests keep using `server.js` / `npm test`, so this
 * file is only used by the hosting platform.
 */
const connectDB = require('../config/db');

let connectionPromise = null;

/**
 * Connect at most once per warm container. If a connection attempt fails the
 * promise is cleared so that the next request can retry.
 */
const ensureDatabase = () => {
  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
};

// app.js is required after the connect helper is defined so that a failure to
// load the models surfaces as a normal function error instead of hanging.
const app = require('../app');

/**
 * Node (req, res) request listener, which is what the Vercel Node runtime
 * expects from a function file.
 */
module.exports = async (req, res) => {
  try {
    await ensureDatabase();
  } catch (error) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      })
    );
    return;
  }

  return app(req, res);
};
