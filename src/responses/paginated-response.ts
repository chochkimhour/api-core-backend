import { getPaginationMeta } from "../pagination/pagination";
import type { PaginationMeta } from "../types/pagination.types";
import type { PaginatedResponse } from "../types/response.types";

export interface PaginatedResponseInput<T> {
  message?: string;
  data?: T[];
  page: number;
  limit: number;
  total: number;
}

/** Creates a standard successful response with pagination metadata. */
export function paginatedResponse<T = unknown>(
  input: PaginatedResponseInput<T>
): PaginatedResponse<T> {
  const pagination: PaginationMeta = getPaginationMeta({
    page: input.page,
    limit: input.limit,
    total: input.total
  });

  return {
    success: true,
    message: input.message ?? "Data fetched successfully",
    data: input.data ?? [],
    pagination,
    timestamp: new Date().toISOString()
  };
}
