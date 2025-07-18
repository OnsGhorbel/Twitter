// API Configuration for Twitter Clone
const API_CONFIG = {
  // Development mode - set to true to use mock API instead of real API
  USE_MOCK_API: process.env.REACT_APP_USE_MOCK_API === 'true' || process.env.NODE_ENV === 'development',
  
  // API Gateway URL
  API_GATEWAY_URL: process.env.REACT_APP_API_GATEWAY_URL || 'https://api.twitter-clone.com',
  
  // Authorization Server URL
  AUTH_SERVER_URL: process.env.REACT_APP_AUTH_SERVER_URL || 'https://auth.twitter-clone.com',
  
  // Apiman Configuration
  APIMAN_CONFIG: {
    baseUrl: process.env.REACT_APP_APIMAN_URL || 'https://apiman.twitter-clone.com',
    organization: process.env.REACT_APP_APIMAN_ORG || 'twitter-clone-org',
    version: process.env.REACT_APP_APIMAN_VERSION || '1.0',
    apiKey: process.env.REACT_APP_APIMAN_API_KEY || '',
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify',
    
    // User endpoints
    USER_PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    
    // Tweet endpoints
    TWEETS: '/api/v1/tweets',
    USER_TWEETS: '/api/v1/tweets/user',
    TWEET_DETAIL: '/api/v1/tweets',
    
    // Timeline endpoints
    TIMELINE: '/api/v1/timeline',
    HOME_TIMELINE: '/api/v1/timeline/home',
    
    // Search endpoints
    SEARCH: '/api/v1/search',
    
    // Follow endpoints
    FOLLOW: '/api/v1/follow',
    UNFOLLOW: '/api/v1/unfollow',
    FOLLOWERS: '/api/v1/followers',
    FOLLOWING: '/api/v1/following',
  },
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Token storage keys
  TOKEN_STORAGE_KEY: 'twitter_access_token',
  REFRESH_TOKEN_STORAGE_KEY: 'twitter_refresh_token',
  USER_STORAGE_KEY: 'twitter_user',
};

export default API_CONFIG;
