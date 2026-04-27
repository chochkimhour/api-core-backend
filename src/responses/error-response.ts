import type { ApiError } from "../types/error.types";
import { getCambodiaTimestamp } from "../utils/timestamp";

export interface ErrorResponseInput {
  message?: string;
  code?: string;
  details?: unknown;
}

/** Creates a standard failed JSON API response. */
export function errorResponse(input: ErrorResponseInput = {}): ApiError {
  const response: ApiError = {
    success: false,
    message: input.message ?? "Something went wrong",
    error: input.code ?? "INTERNAL_SERVER_ERROR",
    timestamp: getCambodiaTimestamp(),
  };

  if (input.details !== undefined) {
    response.details = input.details;
  }

  return response;
}
