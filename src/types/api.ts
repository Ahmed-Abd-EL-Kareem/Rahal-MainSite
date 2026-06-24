export interface SuccessResponse<T> {
  status: 'success';
  message?: string;
  length?: number;
  results?: number;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
    totalPages?: number;
  };
}

export interface ErrorResponse {
  status: 'fail' | 'error';
  message: string;
  error?: any;
  stack?: string;
}
