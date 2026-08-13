const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount routes under /api
app.use('/api', routes);

// 404 Route
app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server error detail:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: "A generic database or server error occurred. Please check server logs." 
  });
});

app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT}`);
});

module.exports = app;
