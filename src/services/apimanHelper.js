import API_CONFIG from '../config/apiConfig';

/**
 * Apiman Integration Helper
 * Provides utilities for connecting to Apiman Gateway
 */
export class ApimanHelper {
  /**
   * Generate Apiman Gateway URL for an API
   * @param {string} apiName - The name of the API in Apiman
   * @param {string} endpoint - The specific endpoint path
   * @returns {string} Complete Apiman Gateway URL
   */
  static getGatewayUrl(apiName, endpoint = '') {
    const { organization, version } = API_CONFIG.APIMAN_CONFIG;
    const baseUrl = API_CONFIG.APIMAN_CONFIG.baseUrl.replace('/apiman', '/apiman-gateway');
    
    return `${baseUrl}/${organization}/${apiName}/${version}${endpoint}`;
  }

  /**
   * Get headers required for Apiman requests
   * @returns {object} Headers object with Apiman-specific headers
   */
  static getApimanHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API Key if available
    if (API_CONFIG.APIMAN_CONFIG.apiKey) {
      headers['X-API-Key'] = API_CONFIG.APIMAN_CONFIG.apiKey;
    }

    // Add organization and version headers
    headers['X-Apiman-Organization'] = API_CONFIG.APIMAN_CONFIG.organization;
    headers['X-Apiman-Version'] = API_CONFIG.APIMAN_CONFIG.version;

    return headers;
  }

  /**
   * Get authentication endpoints through Apiman
   * @returns {object} Auth endpoints
   */
  static getAuthEndpoints() {
    return {
      login: this.getGatewayUrl('twitter-auth', '/auth/login'),
      register: this.getGatewayUrl('twitter-auth', '/auth/register'),
      refresh: this.getGatewayUrl('twitter-auth', '/auth/refresh'),
      logout: this.getGatewayUrl('twitter-auth', '/auth/logout'),
      verify: this.getGatewayUrl('twitter-auth', '/auth/verify'),
    };
  }

  /**
   * Get API endpoints through Apiman
   * @returns {object} API endpoints
   */
  static getApiEndpoints() {
    return {
      tweets: this.getGatewayUrl('twitter-api', '/api/v1/tweets'),
      userTweets: this.getGatewayUrl('twitter-api', '/api/v1/tweets/user'),
      timeline: this.getGatewayUrl('twitter-api', '/api/v1/timeline'),
      homeTimeline: this.getGatewayUrl('twitter-api', '/api/v1/timeline/home'),
      search: this.getGatewayUrl('twitter-api', '/api/v1/search'),
      userProfile: this.getGatewayUrl('twitter-api', '/api/v1/users/profile'),
      follow: this.getGatewayUrl('twitter-api', '/api/v1/follow'),
      unfollow: this.getGatewayUrl('twitter-api', '/api/v1/unfollow'),
      followers: this.getGatewayUrl('twitter-api', '/api/v1/followers'),
      following: this.getGatewayUrl('twitter-api', '/api/v1/following'),
    };
  }

  /**
   * Validate Apiman configuration
   * @returns {boolean} True if configuration is valid
   */
  static validateConfig() {
    const config = API_CONFIG.APIMAN_CONFIG;
    
    const required = ['baseUrl', 'organization', 'version'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      console.error('Missing Apiman configuration:', missing);
      return false;
    }
    
    if (!config.apiKey) {
      console.warn('Apiman API Key is not configured. Some requests may fail.');
    }
    
    return true;
  }

  /**
   * Test Apiman connection
   * @returns {Promise<boolean>} True if connection is successful
   */
  static async testConnection() {
    try {
      const url = `${API_CONFIG.APIMAN_CONFIG.baseUrl}/system/status`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getApimanHeaders(),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Apiman connection test failed:', error);
      return false;
    }
  }
}

export default ApimanHelper;
