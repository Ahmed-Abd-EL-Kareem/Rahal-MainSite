const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attempt to read JWT token from document cookies (if available on client side)
  if (typeof document !== 'undefined') {
    const tokenMatch = document.cookie.match(/(^|;\s*)token\s*=\s*([^;]*)/);
    const token = tokenMatch ? tokenMatch[2] : null;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });

  if (response.status === 204) {
    return {} as T;
  }

  let resultData;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    resultData = await response.json();
  } else {
    resultData = { message: await response.text() };
  }

  if (!response.ok) {
    throw new APIError(
      resultData.message || 'Something went wrong',
      resultData.status || 'error',
      response.status
    );
  }

  return resultData as T;
}

export const client = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),
    
  post: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  patch: <T>(path: string, body?: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
    
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
