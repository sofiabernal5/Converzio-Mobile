// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required in environment variables');
  process.exit(1);
}

// In-memory data storage (replace with real database later)
let users = [];
let avatars = [];
let videos = [];
let userIdCounter = 1;
let avatarIdCounter = 1;
let videoIdCounter = 1;

// Helper function to find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Helper function to find user by ID
const findUserById = (id) => {
  return users.find(user => user.id === id);
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h' // Token expires in 24 hours
    }
  );
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

// Create a default test user on server start (for development)
const createTestUser = async () => {
  const testEmail = 'test@converzio.com';
  const existingUser = findUserByEmail(testEmail);
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = {
      id: userIdCounter++,
      email: testEmail,
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      phone: '555-1234',
      company: 'Converzio Test',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    users.push(testUser);
    console.log('✅ Test user created:', testEmail, 'password: password123');
  } else {
    console.log('✅ Test user already exists:', testEmail);
  }
};

// Create test user when server starts (with small delay to ensure everything is initialized)
setTimeout(() => {
  createTestUser().catch(console.error);
}, 100);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Converzio API is running!', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test route - Enhanced with more info
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test route working!', 
    timestamp: new Date().toISOString(),
    usersCount: users.length,
    testUserExists: !!findUserByEmail('test@converzio.com'),
    testCredentials: {
      email: 'test@converzio.com',
      password: 'password123'
    }
  });
});

// AUTH ENDPOINTS
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, firstName, lastName, phone, company } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: userIdCounter++,
      email,
      name,
      firstName: firstName || name.split(' ')[0],
      lastName: lastName || name.split(' ')[1] || '',
      phone: phone || '',
      company: company || '',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Generate JWT token
    const token = generateToken(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    // Return current user without password
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a real app with a blacklist, you might add the token to a blacklist here
  // For now, just return success - the client will remove the token
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token, userInfo } = req.body;
    
    if (!userInfo || !userInfo.email) {
      return res.status(400).json({ message: 'Google user info is required' });
    }

    // Check if user exists
    let user = findUserByEmail(userInfo.email);
    
    if (!user) {
      // Create new user from Google info
      user = {
        id: userIdCounter++,
        email: userInfo.email,
        name: userInfo.name || 'Google User',
        firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || 'Google',
        lastName: userInfo.family_name || userInfo.name?.split(' ')[1] || 'User',
        phone: '',
        company: '',
        avatar: userInfo.picture,
        googleId: userInfo.id,
        createdAt: new Date().toISOString(),
        // No password for Google users
      };
      users.push(user);
    } else {
      // Update existing user with Google info
      user.avatar = userInfo.picture || user.avatar;
      user.googleId = userInfo.id;
      user.lastLogin = new Date().toISOString();
    }

    // Generate JWT token
    const authToken = generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Google authentication successful',
      user: userWithoutPassword,
      token: authToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', authenticateToken, (req, res) => {
  try {
    // Generate new token
    const newToken = generateToken(req.user);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// USER DATA ENDPOINTS
// GET /api/user/avatars
app.get('/api/user/avatars', authenticateToken, (req, res) => {
  try {
    const userAvatars = avatars.filter(avatar => avatar.userId === req.user.id);
    res.json(userAvatars);
  } catch (error) {
    console.error('Get avatars error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/user/avatars
app.post('/api/user/avatars', authenticateToken, (req, res) => {
  try {
    const { name, voiceDescription } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Avatar name is required' });
    }

    const newAvatar = {
      id: `avatar_${avatarIdCounter++}`,
      userId: req.user.id,
      name,
      status: 'processing',
      voiceDescription: voiceDescription || '',
      createdAt: new Date().toISOString(),
    };

    avatars.push(newAvatar);

    // Simulate processing completion after 5 seconds (for demo)
    setTimeout(() => {
      const avatar = avatars.find(a => a.id === newAvatar.id);
      if (avatar) {
        avatar.status = 'ready';
        avatar.imageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.name}`;
      }
    }, 5000);

    res.status(201).json(newAvatar);
  } catch (error) {
    console.error('Create avatar error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/user/avatars/:id
app.delete('/api/user/avatars/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const avatarIndex = avatars.findIndex(
      avatar => avatar.id === id && avatar.userId === req.user.id
    );

    if (avatarIndex === -1) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    avatars.splice(avatarIndex, 1);
    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/videos
app.get('/api/user/videos', authenticateToken, (req, res) => {
  try {
    const userVideos = videos.filter(video => video.userId === req.user.id);
    res.json(userVideos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/user/videos
app.post('/api/user/videos', authenticateToken, (req, res) => {
  try {
    const { title, script, avatarId } = req.body;
    
    if (!title || !script || !avatarId) {
      return res.status(400).json({ message: 'Title, script, and avatarId are required' });
    }

    // Check if avatar belongs to user
    const avatar = avatars.find(
      a => a.id === avatarId && a.userId === req.user.id
    );
    
    if (!avatar) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    const newVideo = {
      id: `video_${videoIdCounter++}`,
      userId: req.user.id,
      title,
      script,
      avatarId,
      status: 'processing',
      views: 0,
      createdAt: new Date().toISOString(),
    };

    videos.push(newVideo);

    // Simulate processing completion after 10 seconds (for demo)
    setTimeout(() => {
      const video = videos.find(v => v.id === newVideo.id);
      if (video) {
        video.status = 'ready';
        video.videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
        video.thumbnailUrl = `https://img.youtube.com/vi/sample/maxresdefault.jpg`;
        video.duration = 30; // 30 seconds
      }
    }, 10000);

    res.status(201).json(newVideo);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/user/videos/:id
app.delete('/api/user/videos/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const videoIndex = videos.findIndex(
      video => video.id === id && video.userId === req.user.id
    );

    if (videoIndex === -1) {
      return res.status(404).json({ message: 'Video not found' });
    }

    videos.splice(videoIndex, 1);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/analytics
app.get('/api/user/analytics', authenticateToken, (req, res) => {
  try {
    const userAvatars = avatars.filter(avatar => avatar.userId === req.user.id);
    const userVideos = videos.filter(video => video.userId === req.user.id);
    
    // Generate sample recent activity
    const recentActivity = [];
    
    // Add recent avatars
    userAvatars
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .forEach(avatar => {
        recentActivity.push({
          id: `activity_avatar_${avatar.id}`,
          type: 'avatar_created',
          message: `Avatar "${avatar.name}" was created`,
          createdAt: avatar.createdAt,
        });
      });

    // Add recent videos
    userVideos
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .forEach(video => {
        recentActivity.push({
          id: `activity_video_${video.id}`,
          type: 'video_created',
          message: `Video "${video.title}" was generated`,
          createdAt: video.createdAt,
        });
      });

    // Add profile update activity
    if (req.user.updatedAt) {
      recentActivity.push({
        id: 'activity_profile_update',
        type: 'profile_updated',
        message: 'Profile information was updated',
        createdAt: req.user.updatedAt,
      });
    }

    // Sort by date and limit to 5 recent activities
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const analytics = {
      totalAvatars: userAvatars.length,
      totalVideos: userVideos.length,
      totalViews: userVideos.reduce((total, video) => total + (video.views || Math.floor(Math.random() * 100)), 0),
      recentActivity: sortedActivity,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const { password: _, ...userProfile } = req.user;
    res.json(userProfile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/user/profile
app.put('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const { name, firstName, lastName, phone, company, bio, website, location } = req.body;
    
    // Update user data
    const userIndex = users.findIndex(user => user.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      phone: phone || users[userIndex].phone,
      company: company || users[userIndex].company,
      bio: bio || users[userIndex].bio,
      website: website || users[userIndex].website,
      location: location || users[userIndex].location,
      updatedAt: new Date().toISOString(),
    };

    const { password: _, ...updatedProfile } = users[userIndex];
    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    users: users.length,
    avatars: avatars.length,
    videos: videos.length,
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    message: 'Server is running',
    data: {
      users: users.length,
      avatars: avatars.length,
      videos: videos.length,
      userEmails: users.map(u => u.email), // See what users exist
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});


// Port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Converzio API Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Available endpoints:');
  console.log('  GET  / - API status');
  console.log('  GET  /api/test - Test endpoint');
  console.log('  GET  /api/health - Health check');
  console.log('  POST /api/auth/register - User registration');
  console.log('  POST /api/auth/login - User login');
  console.log('  GET  /api/auth/me - Get current user');
  console.log('  POST /api/auth/logout - User logout');
  console.log('  POST /api/auth/google - Google OAuth');
  console.log('  POST /api/auth/refresh - Refresh JWT token');
  console.log('  GET  /api/user/avatars - Get user avatars');
  console.log('  POST /api/user/avatars - Create avatar');
  console.log('  DELETE /api/user/avatars/:id - Delete avatar');
  console.log('  GET  /api/user/videos - Get user videos');
  console.log('  POST /api/user/videos - Create video');
  console.log('  DELETE /api/user/videos/:id - Delete video');
  console.log('  GET  /api/user/analytics - Get user analytics');
  console.log('  GET  /api/user/profile - Get user profile');
  console.log('  PUT  /api/user/profile - Update user profile');
  console.log('Data storage: In-memory (add database for production)');
  console.log('Security: JWT tokens with bcrypt password hashing');
});