import { getPaginationMeta } from "../pagination/pagination";
import type { PaginationMeta } from "../types/pagination.types";
import type { PaginatedResponse } from "../types/response.types";
import { getCambodiaTimestamp } from "../utils/timestamp";

export interface PaginatedResponseInput<T> {
  message?: string;
  data?: T[];
  page: number;
  max?: number;
  limit?: number;
  total: number;
}

export interface PaginatedResponseWithMetaInput<T> {
  message?: string;
  data?: T[];
  meta: {
    page: number;
    max?: number;
    limit?: number;
    total: number;
  };
}

/** Creates a standard successful response with pagination metadata. */
export function paginatedResponse<T = unknown>(
  input: PaginatedResponseInput<T> | PaginatedResponseWithMetaInput<T>,
): PaginatedResponse<T> {
  const meta = "meta" in input ? input.meta : input;
  const paginationInput = {
    page: meta.page,
    ...(meta.max !== undefined ? { max: meta.max } : {}),
    ...(meta.limit !== undefined ? { limit: meta.limit } : {}),
    total: meta.total,
  };
  const pagination: PaginationMeta = getPaginationMeta(paginationInput);

  return {
    success: true,
    message: input.message ?? "Data fetched successfully",
    data: input.data ?? [],
    total: pagination.total,
    timestamp: getCambodiaTimestamp(),
  };
}
