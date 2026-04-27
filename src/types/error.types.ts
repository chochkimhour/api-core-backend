export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown;
  };
  timestamp: string;
}
