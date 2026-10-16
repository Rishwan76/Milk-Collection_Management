require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const milkRoutes = require('./routes/milkRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  'https://milk-collection-management-hextdjp8j-mrr5.vercel.app',
  'https://milk-collection-management-paa2ptlng-mrr5.vercel.app',
  ...(process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
];

// CORS configuration
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '100kb' }));

// Backend health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok'
  });
});

// API routes
app.use('/api/milk', milkRoutes);
app.use('/api/reports', reportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });