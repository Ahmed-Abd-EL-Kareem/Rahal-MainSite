import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rahal-back-end.vercel.app/api/v1';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to automatically inject bearer token from cookies
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof document !== 'undefined') {
      const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
