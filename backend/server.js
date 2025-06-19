// backend/server.js - Updated for registered_users table
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

// Registration endpoint - saves form data to registered_users table
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
    const checkQuery = 'SELECT id FROM registered_users WHERE email = ? LIMIT 1';
    const [existing] = await connection.execute(checkQuery, [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Insert into registered_users table with correct field names
    const insertQuery = `
      INSERT INTO registered_users (first_name, last_name, phone, company_name, email, password, user_type, created) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await connection.execute(insertQuery, [
      firstName,           // first_name
      lastName,            // last_name  
      phone || '',         // phone
      company || '',       // company_name
      email,               // email
      password,            // password (in production, this should be hashed)
      'standard'           // user_type default value
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

// Login endpoint - checks credentials against registered_users table
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
    
    // Step 1: Check if email exists in database
    const emailCheckQuery = 'SELECT id, first_name, last_name, email FROM registered_users WHERE email = ? LIMIT 1';
    const [emailRows] = await connection.execute(emailCheckQuery, [email]);

    if (emailRows.length === 0) {
      console.log('Email not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Email not found. Please check your email or sign up for an account.'
      });
    }

    console.log('Email found:', email);

    // Step 2: Now check if password matches for that email
    const passwordCheckQuery = `
      SELECT id, first_name, last_name, email, phone, company_name, role, photo, 
             instagram, tiktok, facebook, linkedin, website, user_type, created 
      FROM registered_users 
      WHERE email = ? AND password = ? 
      LIMIT 1
    `;
    
    const [passwordRows] = await connection.execute(passwordCheckQuery, [email, password]);

    if (passwordRows.length === 0) {
      console.log('Wrong password for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    const user = passwordRows[0];
    console.log('Login successful:', { id: user.id, email: user.email, name: `${user.first_name} ${user.last_name}` });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        company: user.company_name,
        role: user.role,
        photo: user.photo,
        instagram: user.instagram,
        tiktok: user.tiktok,
        facebook: user.facebook,
        linkedin: user.linkedin,
        website: user.website,
        userType: user.user_type
      }
    });

  } catch (error) {
    console.error('Login error:', error);
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

// Get user profile endpoint
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  
  let connection;
  try {
    connection = await createConnection();
    const query = `
      SELECT id, first_name, last_name, email, phone, company_name, role, logo, photo, 
             instagram, tiktok, facebook, linkedin, website, user_type, created 
      FROM registered_users 
      WHERE id = ? 
      LIMIT 1
    `;
    
    const [rows] = await connection.execute(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        company: user.company_name,
        role: user.role,
        logo: user.logo,
        photo: user.photo,
        instagram: user.instagram,
        tiktok: user.tiktok,
        facebook: user.facebook,
        linkedin: user.linkedin,
        website: user.website,
        userType: user.user_type,
        created: user.created
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user: ' + error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Update user profile endpoint
app.put('/api/user/:id/profile', async (req, res) => {
  const { id } = req.params;
  const { 
    role, 
    logo, 
    photo, 
    instagram, 
    tiktok, 
    facebook, 
    linkedin, 
    website 
  } = req.body;
  
  console.log('🔄 Profile update attempt for user:', id);
  
  let connection;
  try {
    connection = await createConnection();
    
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (logo !== undefined) {
      updateFields.push('logo = ?');
      updateValues.push(logo);
    }
    if (photo !== undefined) {
      updateFields.push('photo = ?');
      updateValues.push(photo);
    }
    if (instagram !== undefined) {
      updateFields.push('instagram = ?');
      updateValues.push(instagram);
    }
    if (tiktok !== undefined) {
      updateFields.push('tiktok = ?');
      updateValues.push(tiktok);
    }
    if (facebook !== undefined) {
      updateFields.push('facebook = ?');
      updateValues.push(facebook);
    }
    if (linkedin !== undefined) {
      updateFields.push('linkedin = ?');
      updateValues.push(linkedin);
    }
    if (website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(website);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE registered_users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;
    
    const [result] = await connection.execute(updateQuery, updateValues);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ Profile updated successfully for user:', id);
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed: ' + error.message
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
    const [rows] = await connection.execute(`
      SELECT id, first_name, last_name, phone, company_name, email, role, 
             instagram, tiktok, facebook, linkedin, website, user_type, created 
      FROM registered_users 
      ORDER BY created DESC
    `);
    
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Converzio Backend Server Running! 
Port: ${PORT}
Local: http://localhost:${PORT}/api/health
Network: http://10.134.171.56:${PORT}/api/health
Database Test: http://localhost:${PORT}/api/test-db
Users List: http://localhost:${PORT}/api/users
Environment: ${process.env.NODE_ENV || 'development'}
📱 Your phone can now connect to: http://10.134.171.56:${PORT}
  `);
});

module.exports = app;