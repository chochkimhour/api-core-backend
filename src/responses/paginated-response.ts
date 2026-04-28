import { getPaginationMeta } from "../pagination/pagination";
import type { PaginationMeta } from "../types/pagination.types";
import type { PaginatedResponse } from "../types/response.types";
import { getCambodiaTimestamp } from "../utils/timestamp";

export interface PaginatedResponseInput<T> {
  message?: string;
  data?: T[];
  max?: number;
  offset?: number;
  total: number;
}

export interface PaginatedResponseWithMetaInput<T> {
  message?: string;
  data?: T[];
  meta: {
    max?: number;
    offset?: number;
    total: number;
  };
}

/** Creates a standard successful response with pagination metadata. */
export function paginatedResponse<T = unknown>(
  input: PaginatedResponseInput<T> | PaginatedResponseWithMetaInput<T>,
): PaginatedResponse<T> {
  const meta = "meta" in input ? input.meta : input;
  const paginationInput = {
    ...(meta.max !== undefined ? { max: meta.max } : {}),
    ...(meta.offset !== undefined ? { offset: meta.offset } : {}),
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
