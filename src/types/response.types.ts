import type { PaginationMeta } from "./pagination.types";

export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}
