/**
 * Entry point of the Portfolio & Blog API.
 * Loads the environment variables, connects to MongoDB Atlas and starts listening.
 *
 * Local:      npm run dev      -> http://localhost:5000
 * Production: npm start        -> Render / Heroku inject the PORT variable
 */
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (error) {
    console.error(`Failed to start the server: ${error.message}`);
    process.exit(1);
  }
};

// Do not start a listener when the app is imported by the test suite.
if (require.main === module) {
  start();
}

module.exports = start;
