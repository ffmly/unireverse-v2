// API Configuration
// Use environment variable for production, fallback to localhost for development
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/api/users`,
  STADIUMS: `${API_BASE_URL}/api/stadiums`,
  TIME_SLOTS: `${API_BASE_URL}/api/time-slots`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  FRIENDLY_MATCHES: `${API_BASE_URL}/api/friendly-matches`,
  PING: `${API_BASE_URL}/api/ping`,
} as const;

// API timeout configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Helper function to make API calls with timeout
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    console.log(`🌐 Making API call to: ${url}`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log(`✅ API call successful: ${url} (${response.status})`);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`⏰ API call timed out: ${url} (${API_TIMEOUT}ms)`);
      throw new Error(`Request timed out after ${API_TIMEOUT/1000} seconds`);
    } else if (error.message.includes('Network request failed')) {
      console.error(`🌐 Network error: ${url} - Check if server is running`);
      throw new Error('Network error - Check if server is running');
    } else if (error.message.includes('Failed to fetch')) {
      console.error(`🌐 Server error: ${url} - Server may be down`);
      throw new Error('Server error - There seems to be a problem with our servers');
    } else {
      console.error(`❌ API call failed: ${url}`, error);
      throw error;
    }
  }
};
