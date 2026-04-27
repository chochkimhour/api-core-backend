export interface ApiError {
  success: false;
  message: string;
  error: string;
  details?: unknown;
  timestamp: string;
}
