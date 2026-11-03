const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const blogRoutes = require('./routes/blogRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

/**
 * The Express application is created here (and exported) so that the very same
 * app can be started by server.js and exercised by the automated tests.
 */
const app = express();

/* ----------------------------- Security ---------------------------------- */
app.use(helmet()); // secure HTTP headers

const allowedOrigins = [
  process.env.CLIENT_URL, // deployed front-end (e.g. https://my-portfolio.vercel.app)
  'http://localhost:5173', // Vite dev server
  'http://localhost:4173', // Vite preview server
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow tools such as Postman / curl (no Origin header) and any
      // origin listed in CLIENT_URL / localhost during development.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

/* ----------------------------- Body parsing ------------------------------ */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); // request logging
}

/* -------------------------------- Routes --------------------------------- */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Portfolio & Blog API is running',
    docs: 'See README.md for the full endpoint reference',
    endpoints: {
      users: '/api/users',
      projects: '/api/projects',
      blog: '/api/blog',
      contact: '/api/contact',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', uptime: process.uptime() });
});

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', messageRoutes);

/* --------------------------- Error handling ------------------------------ */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
