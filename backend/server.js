// backend/server.js
import dotenv from 'dotenv';
dotenv.config();

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (you can restrict it later)
app.use(express.json()); // Parse JSON request bodies

// Example route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Example API route group
app.use('/api/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
