import type { ValidationErrorItem } from "../types/response.types";

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: ValidationErrorItem[];
  timestamp: string;
}

export interface ValidationErrorResponseInput {
  message?: string;
  errors?: ValidationErrorItem[];
}

/** Creates a standard validation error response. */
export function validationErrorResponse(
  input: ValidationErrorResponseInput = {},
): ValidationErrorResponse {
  return {
    success: false,
    message: input.message ?? "Validation failed",
    errors: input.errors ?? [],
    timestamp: new Date().toISOString(),
  };
}
