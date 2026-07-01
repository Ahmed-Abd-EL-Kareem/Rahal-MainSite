import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("BASE_URL", BASE_URL);

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
  const response = await apiClient.request({
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

function createRetryInterceptor(maxRetries = 3) {
  return async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    const isNetworkError = !error.response;
    const isRetryableStatus = error.response?.status ? error.response.status >= 500 : false;
    const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase() || '');
    const retryCount = config._retryCount || 0;

    if ((isNetworkError || isRetryableStatus) && isIdempotent && retryCount < maxRetries) {
      config._retryCount = retryCount + 1;
      const delay = Math.min(1000 * 2 ** retryCount, 8000);
      await new Promise((r) => setTimeout(r, delay));
      return apiClient.request(config);
    }
    throw error;
  };
}

function createAIClient() {
  const aiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 300000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  aiClient.interceptors.request.use((config) => {
    if (typeof document !== 'undefined') {
      const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
      const token = tokenMatch ? tokenMatch[2] : null;
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const localeMatch = document.cookie.match(/(^|;\s*)NEXT_LOCALE\s*=\s*([^;]*)/);
      const locale = localeMatch ? localeMatch[2] : 'en';
      if (locale && !config.headers['Accept-Language']) {
        config.headers['Accept-Language'] = locale;
      }
    }
    return config;
  });

  aiClient.interceptors.response.use(
    (response) => response,
    createRetryInterceptor(3)
  );

  return aiClient;
}

export const aiClient = createAIClient();

async function aiRequest<T>(
  path: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  const response = await aiClient.request({
    url: path,
    ...options,
  });
  return response.data;
}

export const ai = {
  get: <T>(path: string, options?: AxiosRequestConfig) =>
    aiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: AxiosRequestConfig) =>
    aiRequest<T>(path, {
      ...options,
      method: 'POST',
      data: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: AxiosRequestConfig) =>
    aiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      data: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: AxiosRequestConfig) =>
    aiRequest<T>(path, { ...options, method: 'DELETE' }),
};