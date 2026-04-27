import type { ApiResponse } from "../types/response.types";

export interface SuccessResponseInput<T> {
  message?: string;
  data?: T;
}

export interface ResponseInput<T> extends SuccessResponseInput<T> {
  total?: number;
}

export type ResponseResult<T> = ApiResponse<T | Record<string, never>> & {
  total?: number;
};

function getTotal(data: unknown, total?: number): number | undefined {
  if (total !== undefined) {
    return total;
  }

  return Array.isArray(data) ? data.length : undefined;
}

function isResponseInput<T>(value: unknown): value is ResponseInput<T> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(value, "message") ||
    Object.prototype.hasOwnProperty.call(value, "data") ||
    Object.prototype.hasOwnProperty.call(value, "total")
  );
}

/** Creates a standard successful JSON API response. */
export function successResponse<T = unknown>(
  input: SuccessResponseInput<T> = {},
): ApiResponse<T | Record<string, never>> {
  const hasData = Object.prototype.hasOwnProperty.call(input, "data");

  return {
    success: true,
    message: input.message ?? "Request successful",
    data: hasData ? (input.data as T) : {},
    timestamp: new Date().toISOString(),
  };
}

/** Creates a simple successful JSON API response from data or an input object. */
export function response<T = unknown>(
  input?: T | ResponseInput<T>,
  total?: number,
): ResponseResult<T> {
  const responseInput: ResponseInput<T> = isResponseInput<T>(input)
    ? input
    : { data: input as T, ...(total !== undefined ? { total } : {}) };
  const hasData = Object.prototype.hasOwnProperty.call(responseInput, "data");
  const responseTotal = getTotal(responseInput.data, responseInput.total);
  const result = {
    success: true,
    message: responseInput.message ?? "Request successful",
    data: hasData ? (responseInput.data as T) : {},
    ...(responseTotal !== undefined ? { total: responseTotal } : {}),
    timestamp: new Date().toISOString(),
  } as ResponseResult<T>;

  return result;
}
