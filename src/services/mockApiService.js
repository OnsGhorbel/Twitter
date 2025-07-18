// Mock API service for development and testing
// This service provides fake data and simulates API calls

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=1DA1F2&color=fff',
    followers: 156,
    following: 89,
    joined: '2021-01-15'
  },
  {
    id: 2,
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=17BF63&color=fff',
    followers: 234,
    following: 123,
    joined: '2021-03-22'
  },
  {
    id: 3,
    name: 'Demo User',
    username: 'demouser',
    email: 'demo@twitter.com',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=E1306C&color=fff',
    followers: 1000,
    following: 500,
    joined: '2020-12-01'
  }
];

// Mock tweet data
const mockTweets = [
  {
    id: 1,
    text: "Just built an amazing Twitter clone with React and Redux! 🚀 #React #Redux #WebDev",
    author: mockUsers[0],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 23,
    retweets: 5,
    replies: 3
  },
  {
    id: 2,
    text: "The API Gateway integration with Apiman is working perfectly! Great for managing microservices 🔥",
    author: mockUsers[1],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes: 45,
    retweets: 12,
    replies: 8
  },
  {
    id: 3,
    text: "Authentication with JWT tokens and refresh token rotation is now implemented. Security first! 🔐",
    author: mockUsers[2],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: 67,
    retweets: 23,
    replies: 15
  },
  {
    id: 4,
    text: "The responsive design looks great on mobile devices! 📱 Testing on different screen sizes.",
    author: mockUsers[0],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    likes: 34,
    retweets: 7,
    replies: 4
  },
  {
    id: 5,
    text: "Real-time features coming soon! WebSocket integration for live updates 🔄",
    author: mockUsers[1],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likes: 89,
    retweets: 34,
    replies: 21
  }
];

// Mock API service
export const mockApiService = {
  // Authentication
  async login(credentials) {
    await delay(1000); // Simulate network delay
    
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user && credentials.password) {
      return {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: user
      };
    }
    
    throw new Error('Invalid credentials');
  },

  async register(userData) {
    await delay(1000);
    
    const newUser = {
      id: mockUsers.length + 1,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=1DA1F2&color=fff`,
      followers: 0,
      following: 0,
      joined: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return {
      message: 'User registered successfully',
      user: newUser
    };
  },

  async logout() {
    await delay(500);
    return { message: 'Logged out successfully' };
  },

  async verifyToken() {
    await delay(300);
    return { valid: true };
  },

  // User methods
  async getUserProfile() {
    await delay(500);
    return mockUsers[0]; // Return current user
  },

  async updateUserProfile(userData) {
    await delay(800);
    const updatedUser = { ...mockUsers[0], ...userData };
    mockUsers[0] = updatedUser;
    return updatedUser;
  },

  // Tweet methods
  async getTweets(page = 1, limit = 20) {
    await delay(800);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const tweets = mockTweets.slice(startIndex, endIndex);
    
    return {
      tweets,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(mockTweets.length / limit),
        totalItems: mockTweets.length,
        hasMore: endIndex < mockTweets.length
      }
    };
  },

  async createTweet(tweetData) {
    await delay(600);
    
    const newTweet = {
      id: mockTweets.length + 1,
      text: tweetData.text,
      author: mockUsers[0], // Current user
      createdAt: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      replies: 0
    };
    
    mockTweets.unshift(newTweet);
    return newTweet;
  },

  async getUserTweets(userId, page = 1, limit = 20) {
    await delay(600);
    
    const userTweets = mockTweets.filter(tweet => tweet.author.id === userId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const tweets = userTweets.slice(startIndex, endIndex);
    
    return {
      tweets,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(userTweets.length / limit),
        totalItems: userTweets.length,
        hasMore: endIndex < userTweets.length
      }
    };
  },

  // Timeline methods
  async getTimeline(page = 1, limit = 20) {
    return this.getTweets(page, limit);
  },

  async getHomeTimeline(page = 1, limit = 20) {
    return this.getTweets(page, limit);
  },

  // Search methods
  async search(query, type = 'tweets', page = 1, limit = 20) {
    await delay(700);
    
    if (type === 'tweets') {
      const filteredTweets = mockTweets.filter(tweet =>
        tweet.text.toLowerCase().includes(query.toLowerCase()) ||
        tweet.author.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        tweets: filteredTweets,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(filteredTweets.length / limit),
          totalItems: filteredTweets.length,
          hasMore: false
        }
      };
    } else if (type === 'users') {
      const filteredUsers = mockUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        users: filteredUsers,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(filteredUsers.length / limit),
          totalItems: filteredUsers.length,
          hasMore: false
        }
      };
    }
    
    return { tweets: [], users: [] };
  },

  // Follow methods
  async followUser(userId) {
    await delay(500);
    return { message: 'User followed successfully' };
  },

  async unfollowUser(userId) {
    await delay(500);
    return { message: 'User unfollowed successfully' };
  },

  async getFollowers(userId, page = 1, limit = 20) {
    await delay(600);
    return {
      users: mockUsers.slice(0, 2),
      pagination: {
        page,
        limit,
        totalPages: 1,
        totalItems: 2,
        hasMore: false
      }
    };
  },

  async getFollowing(userId, page = 1, limit = 20) {
    await delay(600);
    return {
      users: mockUsers.slice(1, 3),
      pagination: {
        page,
        limit,
        totalPages: 1,
        totalItems: 2,
        hasMore: false
      }
    };
  }
};

export default mockApiService;
