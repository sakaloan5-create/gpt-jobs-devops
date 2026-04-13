const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(helmet());
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 404, message: 'Not found', data: null });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
