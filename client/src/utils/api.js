import axios from 'axios';

const api = axios.create({
  baseURL: "http://192.168.99.100:3000", // Replace with your API's base URL
  timeout: 10000, // Set your desired timeout for requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    // If a request fails due to a 401 Unauthorized response (i.e., token is invalid/expired)
    // handle it here. For instance, you can redirect user to login page, or refresh the token.
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Redirect to login page, or handle the token refresh, etc.
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
