const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-super-secret-jwt-key';

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Mock data
let users = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: '$2b$10$encrypted_password_here',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=1DA1F2&color=fff',
    followers: 156,
    following: 89,
    joined: '2021-01-15T00:00:00Z'
  },
  {
    id: 2,
    name: 'Demo User',
    username: 'demouser',
    email: 'demo@twitter.com',
    password: '$2b$10$encrypted_password_here',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=E1306C&color=fff',
    followers: 1000,
    following: 500,
    joined: '2020-12-01T00:00:00Z'
  }
];

let tweets = [
  {
    id: 1,
    text: "Just connected to Apiman! API management has never been easier 🚀 #Apiman #API",
    authorId: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 23,
    retweets: 5,
    replies: 3
  },
  {
    id: 2,
    text: "The API Gateway integration is working perfectly! Rate limiting and authentication all set up ✅",
    authorId: 2,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes: 45,
    retweets: 12,
    replies: 8
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'twitter-mock-api',
    version: '1.0.0'
  });
});

// Authentication endpoints
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, accept any password
    // In production, use: await bcrypt.compare(password, user.password)
    if (password) {
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        accessToken,
        refreshToken,
        user: userWithoutPassword
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: users.length + 1,
      name,
      username,
      email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=1DA1F2&color=fff`,
      followers: 0,
      following: 0,
      joined: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  jwt.verify(refreshToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  });
});

app.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// User endpoints
app.get('/api/v1/users/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Tweet endpoints
app.get('/api/v1/tweets', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const tweetsWithAuthors = tweets.map(tweet => ({
    ...tweet,
    author: users.find(u => u.id === tweet.authorId)
  }));
  
  const paginatedTweets = tweetsWithAuthors.slice(startIndex, endIndex);
  
  res.json({
    tweets: paginatedTweets,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(tweets.length / limit),
      totalItems: tweets.length,
      hasMore: endIndex < tweets.length
    }
  });
});

app.post('/api/v1/tweets', authenticateToken, (req, res) => {
  const { text } = req.body;
  
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Tweet text is required' });
  }
  
  const newTweet = {
    id: tweets.length + 1,
    text: text.trim(),
    authorId: req.user.userId,
    createdAt: new Date().toISOString(),
    likes: 0,
    retweets: 0,
    replies: 0
  };
  
  tweets.unshift(newTweet);
  
  const author = users.find(u => u.id === req.user.userId);
  res.status(201).json({
    ...newTweet,
    author
  });
});

// Timeline endpoints
app.get('/api/v1/timeline', authenticateToken, (req, res) => {
  // For simplicity, return all tweets (same as /api/v1/tweets)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const tweetsWithAuthors = tweets.map(tweet => ({
    ...tweet,
    author: users.find(u => u.id === tweet.authorId)
  }));
  
  const paginatedTweets = tweetsWithAuthors.slice(startIndex, endIndex);
  
  res.json({
    tweets: paginatedTweets,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(tweets.length / limit),
      totalItems: tweets.length,
      hasMore: endIndex < tweets.length
    }
  });
});

app.get('/api/v1/timeline/home', authenticateToken, (req, res) => {
  // Same as timeline for this demo
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const tweetsWithAuthors = tweets.map(tweet => ({
    ...tweet,
    author: users.find(u => u.id === tweet.authorId)
  }));
  
  const paginatedTweets = tweetsWithAuthors.slice(startIndex, endIndex);
  
  res.json({
    tweets: paginatedTweets,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(tweets.length / limit),
      totalItems: tweets.length,
      hasMore: endIndex < tweets.length
    }
  });
});

// Search endpoint
app.get('/api/v1/search', authenticateToken, (req, res) => {
  const { q: query, type = 'tweets' } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  if (type === 'tweets') {
    const filteredTweets = tweets
      .filter(tweet => tweet.text.toLowerCase().includes(query.toLowerCase()))
      .map(tweet => ({
        ...tweet,
        author: users.find(u => u.id === tweet.authorId)
      }));
    
    res.json({
      tweets: filteredTweets,
      pagination: {
        page: 1,
        limit: 20,
        totalPages: 1,
        totalItems: filteredTweets.length,
        hasMore: false
      }
    });
  } else if (type === 'users') {
    const filteredUsers = users
      .filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      )
      .map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    
    res.json({
      users: filteredUsers,
      pagination: {
        page: 1,
        limit: 20,
        totalPages: 1,
        totalItems: filteredUsers.length,
        hasMore: false
      }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Twitter Mock API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
