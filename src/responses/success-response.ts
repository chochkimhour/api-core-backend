import type { ApiResponse } from "../types/response.types";

export interface SuccessResponseInput<T> {
  message?: string;
  data?: T;
}

/** Creates a standard successful JSON API response. */
export function successResponse<T = unknown>(
  input: SuccessResponseInput<T> = {}
): ApiResponse<T | Record<string, never>> {
  return {
    success: true,
    message: input.message ?? "Request successful",
    data: input.data ?? {},
    timestamp: new Date().toISOString()
  };
}
