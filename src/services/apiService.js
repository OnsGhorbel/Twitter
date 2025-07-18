import axios from 'axios';
import API_CONFIG from '../config/apiConfig';
import { mockApiService } from './mockApiService';
import ApimanHelper from './apimanHelper';

// Use mock service in development mode
const USE_MOCK = API_CONFIG.USE_MOCK_API;

// Create axios instance for API Gateway (through Apiman)
const apiClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for Auth Server (through Apiman)
const authClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TokenManager = {
  getAccessToken: () => localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY),
  getRefreshToken: () => localStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(API_CONFIG.USER_STORAGE_KEY);
  },
};

// Request interceptor for API Gateway
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Apiman headers
    const apimanHeaders = ApimanHelper.getApimanHeaders();
    config.headers = { ...config.headers, ...apimanHeaders };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor for Auth Server
authClient.interceptors.request.use(
  (config) => {
    // Add Apiman headers for auth requests
    const apimanHeaders = ApimanHelper.getApimanHeaders();
    config.headers = { ...config.headers, ...apimanHeaders };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = TokenManager.getRefreshToken();
      
      if (refreshToken) {
        try {
          const response = await authClient.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          TokenManager.setTokens(accessToken, newRefreshToken);
          
          processQueue(null, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          TokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        TokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // Authentication methods
  async login(credentials) {
    if (USE_MOCK) {
      return mockApiService.login(credentials);
    }
    
    try {
      const url = ApimanHelper.getAuthEndpoints().login;
      const response = await authClient.post(url, credentials);
      const { accessToken, refreshToken, user } = response.data;
      
      TokenManager.setTokens(accessToken, refreshToken);
      localStorage.setItem(API_CONFIG.USER_STORAGE_KEY, JSON.stringify(user));
      
      return { accessToken, refreshToken, user };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  
  async register(userData) {
    if (USE_MOCK) {
      return mockApiService.register(userData);
    }
    
    try {
      const url = ApimanHelper.getAuthEndpoints().register;
      const response = await authClient.post(url, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
  
  async logout() {
    if (USE_MOCK) {
      return mockApiService.logout();
    }
    
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        const url = ApimanHelper.getAuthEndpoints().logout;
        await authClient.post(url, { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
    }
  },
  
  async verifyToken() {
    if (USE_MOCK) {
      return mockApiService.verifyToken();
    }
    
    try {
      const url = ApimanHelper.getAuthEndpoints().verify;
      const response = await authClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  },
  
  // User methods
  async getUserProfile() {
    if (USE_MOCK) {
      return mockApiService.getUserProfile();
    }
    
    try {
      const url = ApimanHelper.getApiEndpoints().userProfile;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },
  
  async updateUserProfile(userData) {
    if (USE_MOCK) {
      return mockApiService.updateUserProfile(userData);
    }
    
    try {
      const url = ApimanHelper.getApiEndpoints().userProfile;
      const response = await apiClient.put(url, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
  
  // Tweet methods
  async getTweets(page = 1, limit = 20) {
    if (USE_MOCK) {
      return mockApiService.getTweets(page, limit);
    }
    
    try {
      const url = `${ApimanHelper.getApiEndpoints().tweets}?page=${page}&limit=${limit}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tweets');
    }
  },
  
  async createTweet(tweetData) {
    if (USE_MOCK) {
      return mockApiService.createTweet(tweetData);
    }
    
    try {
      const url = ApimanHelper.getApiEndpoints().tweets;
      const response = await apiClient.post(url, tweetData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create tweet');
    }
  },
  
  async getUserTweets(userId, page = 1, limit = 20) {
    if (USE_MOCK) {
      return mockApiService.getUserTweets(userId, page, limit);
    }
    
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USER_TWEETS}/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user tweets');
    }
  },
  
  // Timeline methods
  async getTimeline(page = 1, limit = 20) {
    if (USE_MOCK) {
      return mockApiService.getTimeline(page, limit);
    }
    
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.TIMELINE}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch timeline');
    }
  },
  
  async getHomeTimeline(page = 1, limit = 20) {
    if (USE_MOCK) {
      return mockApiService.getHomeTimeline(page, limit);
    }
    
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.HOME_TIMELINE}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch home timeline');
    }
  },
  
  // Search methods
  async search(query, type = 'tweets', page = 1, limit = 20) {
    if (USE_MOCK) {
      return mockApiService.search(query, type, page, limit);
    }
    
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}&type=${type}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  },
  
  // Follow methods
  async followUser(userId) {
    if (USE_MOCK) {
      return mockApiService.followUser(userId);
    }
    
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.FOLLOW}/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to follow user');
    }
  },
  
  async unfollowUser(userId) {
    if (USE_MOCK) {
      return mockApiService.unfollowUser(userId);
    }
    
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.UNFOLLOW}/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unfollow user');
    }
  },
  
  async getFollowers(userId, page = 1, limit = 20) {
    if (USE_MOCK) {
      return mockApiService.getFollowers(userId, page, limit);
    }
    
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.FOLLOWERS}/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch followers');
    }
  },
  
  async getFollowing(userId, page = 1, limit = 20) {
    if (USE_MOCK) {
      return mockApiService.getFollowing(userId, page, limit);
    }
    
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.FOLLOWING}/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch following');
    }
  },
};

export { TokenManager };
export default apiService;
