// backend/server.js - Simple server for Converzio app
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Converzio backend is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend connection successful!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  // Mock successful login
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: 'user-123',
      email: email,
      name: email.split('@')[0],
      token: 'mock-jwt-token'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'All fields required'
    });
  }
  
  // Mock successful registration
  res.json({
    success: true,
    message: 'Registration successful',
    user: {
      id: 'user-' + Date.now(),
      email: email,
      name: name,
      token: 'mock-jwt-token'
    }
  });
});

// User profile endpoint
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString()
    }
  });
});

// Simple avatar endpoints
app.get('/api/avatars', (req, res) => {
  res.json({
    success: true,
    avatars: [
      {
        id: 'avatar-1',
        name: 'Professional Avatar',
        status: 'ready',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/avatars', (req, res) => {
  const { name } = req.body;
  
  res.json({
    success: true,
    avatar: {
      id: 'avatar-' + Date.now(),
      name: name || 'New Avatar',
      status: 'processing',
      createdAt: new Date().toISOString()
    }
  });
});

// Simple video endpoints
app.get('/api/videos', (req, res) => {
  res.json({
    success: true,
    videos: [
      {
        id: 'video-1',
        title: 'Welcome Video',
        status: 'ready',
        duration: 30,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/videos', (req, res) => {
  const { title, script } = req.body;
  
  res.json({
    success: true,
    video: {
      id: 'video-' + Date.now(),
      title: title || 'New Video',
      script: script || '',
      status: 'processing',
      createdAt: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  Converzio Backend Server Running! 
  Port: ${PORT}
  Health: http://localhost:${PORT}/api/health
  Test: http://localhost:${PORT}/api/test
  Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

module.exports = app;