import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const rawApiUrl = (import.meta as any).env?.VITE_API_URL || '';
const baseApiUrl = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`) : '/api';

const api = axios.create({
  baseURL: baseApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem('ecommerce_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        if (parsed.state?.user?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.user.token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth token from local storage', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login'
    ) {
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
        const storedAuth = localStorage.getItem('ecommerce_auth');
        let refreshToken = '';
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          refreshToken = parsed.state?.user?.refreshToken || '';
        }

        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        const res = await axios.post(`${baseApiUrl}/auth/refresh`, { refreshToken });
        const { token: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

        useAuthStore.getState().setToken(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
