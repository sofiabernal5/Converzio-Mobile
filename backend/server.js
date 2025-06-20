// backend/server.js - Updated for better network connectivity and debugging with dynamic testing
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for mobile development
app.use(cors({
  origin: [
    'http://localhost:8081',    // Expo Metro bundler
    'exp://localhost:19000',    // Expo client
    'exp://10.134.171.18:19000', // Expo client on your IP
    'http://10.134.171.18:8081', // Metro bundler on your IP
    'http://192.168.1.*',       // Common local network range
    'http://10.134.171.*',      // Your specific network range
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Enhanced middleware with better logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT'].includes(req.method)) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '[HIDDEN]';
    console.log('Request body:', logBody);
  }
  
  next();
});

// Database connection configuration with better error handling
const createConnection = async () => {
  const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || 'converzio',
    port: process.env.MYSQL_PORT || 3306,
    connectTimeout: 20000,
    acquireTimeout: 20000,
    timeout: 20000,
  };

  try {
    console.log('🔌 Attempting database connection with config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    return connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Database config check:');
    console.error('- MYSQL_HOST:', process.env.MYSQL_HOST || 'Not set (using localhost)');
    console.error('- MYSQL_USER:', process.env.MYSQL_USER || 'Not set (using root)');
    console.error('- MYSQL_DB:', process.env.MYSQL_DB || 'Not set (using converzio)');
    console.error('- MYSQL_PORT:', process.env.MYSQL_PORT || 'Not set (using 3306)');
    throw error;
  }
};

// Enhanced health check endpoint with network info
app.get('/api/health', (req, res) => {
  const networkInfo = {
    status: 'ok',
    message: 'Converzio backend is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    clientIP: req.ip,
    host: req.get('host'),
    userAgent: req.get('user-agent'),
    network: {
      interfaces: require('os').networkInterfaces()
    }
  };
  
  console.log('🩺 Health check from:', req.ip);
  res.json(networkInfo);
});

// Enhanced database test endpoint
app.get('/api/test-db', async (req, res) => {
  let connection;
  try {
    console.log('🧪 Database test requested from:', req.ip);
    connection = await createConnection();
    
    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
    
    // Test if our table exists
    const [tableCheck] = await connection.execute(`
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'registered_users'
    `, [process.env.MYSQL_DB || 'converzio']);
    
    await connection.end();
    
    const result = {
      success: true,
      message: 'Database connection successful!',
      data: rows[0],
      tableExists: tableCheck[0].table_exists > 0,
      database: process.env.MYSQL_DB || 'converzio'
    };
    
    console.log('✅ Database test successful:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      sqlState: error.sqlState || 'Unknown',
      errno: error.errno || 'Unknown'
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
});

// Registration endpoint with enhanced error handling
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, phone, company, password } = req.body;
  
  console.log('📝 Registration attempt from:', req.ip, { firstName, lastName, phone, company, email });
  
  if (!firstName || !lastName || !email || !password) {
    console.log('❌ Registration failed: Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'First name, last name, email, and password are required'
    });
  }

  let connection;
  try {
    connection = await createConnection();
    
    // Check if email already exists
    console.log('🔍 Checking if email exists:', email);
    const checkQuery = 'SELECT id FROM registered_users WHERE email = ? LIMIT 1';
    const [existing] = await connection.execute(checkQuery, [email]);
    
    if (existing.length > 0) {
      console.log('❌ Registration failed: Email already exists');
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Insert into registered_users table
    console.log('💾 Inserting new user into database');
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
      message: 'Registration successful!',
      user: {
        id: result.insertId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        company: company
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
      errorCode: error.code,
      sqlState: error.sqlState
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
});

// Enhanced login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt from:', req.ip, { email });
  
  if (!email || !password) {
    console.log('❌ Login failed: Missing credentials');
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }

  let connection;
  try {
    connection = await createConnection();
    
    // Check if email exists
    console.log('🔍 Checking email:', email);
    const emailCheckQuery = 'SELECT id, first_name, last_name, email FROM registered_users WHERE email = ? LIMIT 1';
    const [emailRows] = await connection.execute(emailCheckQuery, [email]);

    if (emailRows.length === 0) {
      console.log('❌ Login failed: Email not found');
      return res.status(401).json({
        success: false,
        message: 'Email not found. Please check your email or sign up for an account.'
      });
    }

    console.log('✅ Email found, checking password');

    // Check password
    const passwordCheckQuery = `
      SELECT id, first_name, last_name, email, phone, company_name, role, photo, 
             instagram, tiktok, facebook, linkedin, website, user_type, created 
      FROM registered_users 
      WHERE email = ? AND password = ? 
      LIMIT 1
    `;
    
    const [passwordRows] = await connection.execute(passwordCheckQuery, [email, password]);

    if (passwordRows.length === 0) {
      console.log('❌ Login failed: Wrong password');
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    const user = passwordRows[0];
    console.log('✅ Login successful:', { id: user.id, email: user.email });
    
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
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
      errorCode: error.code,
      sqlState: error.sqlState
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
});

// Get user profile endpoint
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log('👤 Profile request for user:', id, 'from:', req.ip);
  
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
      console.log('❌ User not found:', id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rows[0];
    console.log('✅ Profile loaded for user:', id);
    
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
      message: 'Failed to fetch user: ' + error.message,
      errorCode: error.code
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
});

// Update user profile endpoint
app.put('/api/user/:id/profile', async (req, res) => {
  const { id } = req.params;
  const { role, logo, photo, instagram, tiktok, facebook, linkedin, website } = req.body;
  
  console.log('🔄 Profile update for user:', id, 'from:', req.ip);
  
  let connection;
  try {
    connection = await createConnection();
    
    // Build dynamic update query
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
      message: 'Profile update failed: ' + error.message,
      errorCode: error.code
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
});

// Get all users endpoint (for testing)
app.get('/api/users', async (req, res) => {
  console.log('👥 Users list requested from:', req.ip);
  
  let connection;
  try {
    connection = await createConnection();
    const [rows] = await connection.execute(`
      SELECT id, first_name, last_name, phone, company_name, email, role, 
             instagram, tiktok, facebook, linkedin, website, user_type, created 
      FROM registered_users 
      ORDER BY created DESC
    `);
    
    console.log('✅ Users list loaded:', rows.length, 'users');
    
    res.json({
      success: true,
      users: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users: ' + error.message,
      errorCode: error.code
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error('Error closing connection:', e);
      }
    }
  }
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  console.log('❓ 404 - Unknown route:', req.method, req.originalUrl, 'from:', req.ip);
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test-db',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/user/:id',
      'PUT /api/user/:id/profile',
      'GET /api/users'
    ]
  });
});

// Enhanced error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Get network interfaces for display
const getNetworkInterfaces = () => {
  const interfaces = require('os').networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }
  
  return addresses;
};

// Dynamic server testing functions
const testServerEndpoints = async () => {
  const fetch = require('node-fetch');
  const results = {
    health: false,
    database: false,
    endpoints: []
  };

  try {
    // Test health endpoint
    const healthResponse = await fetch(`http://localhost:${PORT}/api/health`, { timeout: 5000 });
    results.health = healthResponse.ok;
  } catch (error) {
    results.health = false;
  }

  try {
    // Test database endpoint
    const dbResponse = await fetch(`http://localhost:${PORT}/api/test-db`, { timeout: 10000 });
    const dbData = await dbResponse.json();
    results.database = dbData.success;
  } catch (error) {
    results.database = false;
  }

  return results;
};

const displayServerStatus = async () => {
  const networkInterfaces = getNetworkInterfaces();
  
  console.log(`
🚀 Converzio Backend Server Starting...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
  `);

  // Test database connection first
  console.log('🔄 Testing database connection...');
  try {
    const connection = await createConnection();
    await connection.end();
    console.log('✅ Database connection: SUCCESSFUL');
  } catch (error) {
    console.log('❌ Database connection: FAILED');
    console.error('   Error:', error.message);
    console.log('   💡 Make sure MySQL is running and database exists');
  }

  // Give server a moment to fully start
  setTimeout(async () => {
    console.log('\n🔄 Testing server endpoints...');
    
    try {
      const testResults = await testServerEndpoints();
      
      console.log(`
📊 SERVER STATUS REPORT:
   🌐 Server Health: ${testResults.health ? '✅ RUNNING' : '❌ NOT RESPONDING'}
   🗄️  Database Test: ${testResults.database ? '✅ CONNECTED' : '❌ CONNECTION FAILED'}

📱 MOBILE DEVICE CONNECTIONS:
   Primary IP:    http://10.134.171.18:${PORT} ${testResults.health ? '✅' : '❌'}
   Health Check:  http://10.134.171.18:${PORT}/api/health
   Database Test: http://10.134.171.18:${PORT}/api/test-db

💻 LOCAL DEVELOPMENT:
   Localhost:     http://localhost:${PORT}/api/health ${testResults.health ? '✅' : '❌'}
   Database Test: http://localhost:${PORT}/api/test-db ${testResults.database ? '✅' : '❌'}
   Users List:    http://localhost:${PORT}/api/users

🔌 DETECTED NETWORK INTERFACES:
${networkInterfaces.map(iface => `   ${iface.name}: http://${iface.address}:${PORT}`).join('\n')}

🗄️  DATABASE CONFIG:
   Host: ${process.env.MYSQL_HOST || 'localhost'}
   Database: ${process.env.MYSQL_DB || 'converzio'}
   User: ${process.env.MYSQL_USER || 'root'}
   Port: ${process.env.MYSQL_PORT || 3306}

📝 API ENDPOINTS:
   GET  /api/health            - Server health check
   GET  /api/test-db           - Database connection test
   POST /api/auth/register     - User registration
   POST /api/auth/login        - User login
   GET  /api/user/:id          - Get user profile
   PUT  /api/user/:id/profile  - Update user profile
   GET  /api/users             - List all users (dev only)

${testResults.health && testResults.database ? 
`🎉 ALL SYSTEMS OPERATIONAL! Your mobile app can now connect.` :
`⚠️  ISSUES DETECTED:
${!testResults.health ? '   • Server not responding to HTTP requests' : ''}
${!testResults.database ? '   • Database connection failed' : ''}

💡 TROUBLESHOOTING:
   • Make sure your phone/simulator is on the same WiFi network
   • Check that MAMP/XAMPP MySQL is running on port 3306
   • Verify database 'converzio' exists with 'registered_users' table
   • If health check fails, restart the server`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    } catch (error) {
      console.log('❌ Server testing failed:', error.message);
    }
  }, 2000);
};

// Start the server with dynamic testing
const server = app.listen(PORT, '0.0.0.0', async () => {
  await displayServerStatus();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;