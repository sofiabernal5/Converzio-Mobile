// backend/server.js - Complete file
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection function
const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      port: process.env.MYSQL_PORT || 3306
    });
    console.log('✅ Database connected successfully');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    await connection.end();
    
    res.json({
      success: true,
      message: 'Database connection successful!',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Registration endpoint - saves form data to MySQL
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, phone, company, password } = req.body;
  
  console.log('📝 Registration attempt:', { firstName, lastName, phone, company, email });
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, email, and password are required'
    });
  }

  let connection;
  try {
    connection = await createConnection();
    
    // Check if email already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ? LIMIT 1';
    const [existing] = await connection.execute(checkQuery, [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Insertion in users table:
    const insertQuery = `
    INSERT INTO users (firstName, lastName, phone, company, email, password, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await connection.execute(insertQuery, [
    firstName,     // First Name from form
    lastName,      // Last Name from form  
    phone || '',   // Phone Number from form
    company || '', // Company from form
    email,         // Email from form
    password       // Password from form
    ]);

    console.log('✅ User registered successfully:', { id: result.insertId, email });

    res.json({
      success: true,
      message: 'Registration successful! Check phpMyAdmin to see your data.',
      user: {
        id: result.insertId,
        email: email,
        firstName: firstName,
        lastName: lastName
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Login endpoint - checks credentials against MySQL
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email });
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }

  let connection;
  try {
    connection = await createConnection();
    
    // Check if email and password match
    const loginQuery = `
      SELECT id, firstName, lastName, phone, company, email, created_at 
      FROM users 
      WHERE email = ? AND password = ? 
      LIMIT 1
    `;
    
    const [rows] = await connection.execute(loginQuery, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = rows[0];
    console.log('✅ Login successful:', { id: user.id, email: user.email });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        company: user.company
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Get all users endpoint (for testing)
app.get('/api/users', async (req, res) => {
  let connection;
  try {
    connection = await createConnection();
    const [rows] = await connection.execute('SELECT id, firstName, lastName, phone, company, email, created_at FROM users');
    
    res.json({
      success: true,
      users: rows
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users: ' + error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Converzio backend is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 404 handler for unknown routes
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

// Start the server
app.listen(PORT, () => {
  console.log(`
🚀 Converzio Backend Server Running! 
Port: ${PORT}
Health: http://localhost:${PORT}/api/health
Database Test: http://localhost:${PORT}/api/test-db
Users List: http://localhost:${PORT}/api/users
Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

module.exports = app;