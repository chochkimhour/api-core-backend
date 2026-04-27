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

export interface PaginatedResponseWithMetaInput<T> {
  message?: string;
  data?: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

/** Creates a standard successful response with pagination metadata. */
export function paginatedResponse<T = unknown>(
  input: PaginatedResponseInput<T> | PaginatedResponseWithMetaInput<T>,
): PaginatedResponse<T> {
  const meta = "meta" in input ? input.meta : input;
  const pagination: PaginationMeta = getPaginationMeta({
    page: meta.page,
    limit: meta.limit,
    total: meta.total,
  });

  return {
    success: true,
    message: input.message ?? "Data fetched successfully",
    data: input.data ?? [],
    total: pagination.total,
    timestamp: new Date().toISOString(),
  };
}
