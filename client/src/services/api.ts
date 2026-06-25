import axios from 'axios';

// Cache active access token in-memory to prevent XSS exposure
let memoryAccessToken: string | null = null;

export const setCachedAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const getCachedAccessToken = () => {
  return memoryAccessToken;
};

// Create custom Axios client — uses VITE_API_URL in production (Render), localhost in dev
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Crucial for reading/writing HTTP-Only refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach dynamic authorization token
api.interceptors.request.use(
  (config) => {
    const token = getCachedAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle expired tokens by running refresh cookies
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Reject immediately if it's not a 401 error or if it's already a retry attempt
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Guard login endpoints to prevent loop recursion
    if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Execute token exchange request
      const refreshResponse = await axios.post(
        `${API_BASE.replace('/api/v1', '')}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = refreshResponse.data.data.accessToken;
      setCachedAccessToken(newAccessToken);

      // Re-route failed requests with new headers
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);
      
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clean tokens and throw session invalid error (AuthContext clears local user)
      setCachedAccessToken(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
