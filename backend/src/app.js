const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ code: 200, message: 'ok', data: { ts: Date.now() } });
});

// API routes
app.use('/api', apiRoutes);

// Admin static files
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Employer submission page
app.use('/submit', express.static(path.join(__dirname, '../public/submit.html')));
app.get('/submit', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/submit.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 404, message: 'Not found', data: null });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
