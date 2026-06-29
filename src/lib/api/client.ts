import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('BASE_URL', process.env.NEXT_PUBLIC_API_URL);

export class APIError extends Error {
  status: string;
  statusCode: number;

  constructor(message: string, status: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.statusCode = statusCode;
  }
}

interface ApiErrorResponse {
  message?: string;
  status?: string;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getLocaleFromCookie(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(^|;\s*)NEXT_LOCALE\s*=\s*([^;]*)/);
  return match ? match[2] : 'en';
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof document !== 'undefined') {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    const token = tokenMatch ? tokenMatch[2] : null;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const locale = getLocaleFromCookie();
    if (locale && !config.headers['Accept-Language']) {
      config.headers['Accept-Language'] = locale;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 204) {
      return response;
    }
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const status = error.response?.data?.status || 'error';
    const statusCode = error.response?.status || 500;
    throw new APIError(message, status, statusCode);
  }
);

async function request<T>(
  path: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const response = await apiClient.request<T>({
    url: path,
    ...options,
  });
  return response.data;
}

export const client = {
  get: <T>(path: string, options?: AxiosRequestConfig) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: AxiosRequestConfig) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      data: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: AxiosRequestConfig) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      data: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: AxiosRequestConfig) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
