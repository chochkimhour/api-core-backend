import type { ApiError } from "../types/error.types";

export interface ErrorResponseInput {
  message?: string;
  code?: string;
  details?: unknown;
}

/** Creates a standard failed JSON API response. */
export function errorResponse(input: ErrorResponseInput = {}): ApiError {
  return {
    success: false,
    message: input.message ?? "Something went wrong",
    error: {
      code: input.code ?? "INTERNAL_SERVER_ERROR",
      details: input.details ?? null,
    },
    timestamp: new Date().toISOString(),
  };
}
