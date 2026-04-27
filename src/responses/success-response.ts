import {
  statusCode as STATUS_CODE,
  type HttpStatusCode,
} from "../constants/http-status";
import type { ApiResponse } from "../types/response.types";

export interface SuccessResponseInput<T> {
  message?: string;
  data?: T;
}

export interface ResponseInput<T> extends SuccessResponseInput<T> {
  statusCode?: HttpStatusCode;
  total?: number;
}

export type ResponseResult<T> = ApiResponse<T | Record<string, never>> & {
  statusCode: HttpStatusCode;
  total?: number;
};

function getTotal(data: unknown, total?: number): number | undefined {
  if (total !== undefined) {
    return total;
  }

  if (data !== null && typeof data === "object") {
    const totalValue = "total" in data ? data.total : undefined;

    if (typeof totalValue === "number" && Number.isFinite(totalValue)) {
      return totalValue;
    }

    if ("data" in data && Array.isArray(data.data)) {
      return data.data.length;
    }
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
    Object.prototype.hasOwnProperty.call(value, "statusCode") ||
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
  statusMessageOrTotal?: HttpStatusCode | string | number,
  messageOrTotal?: string | number,
  total?: number,
): ResponseResult<T> {
  const statusCode =
    typeof statusMessageOrTotal === "number" &&
    typeof messageOrTotal === "string"
      ? (statusMessageOrTotal as HttpStatusCode)
      : undefined;
  const message =
    typeof statusMessageOrTotal === "string"
      ? statusMessageOrTotal
      : typeof messageOrTotal === "string"
        ? messageOrTotal
        : undefined;
  const resolvedTotal =
    typeof statusMessageOrTotal === "number" && messageOrTotal === undefined
      ? statusMessageOrTotal
      : typeof messageOrTotal === "number"
        ? messageOrTotal
        : total;
  const baseInput: ResponseInput<T> = isResponseInput<T>(input)
    ? input
    : {
        data: input as T,
      };
  const responseInput: ResponseInput<T> = {
    ...baseInput,
    ...(statusCode !== undefined ? { statusCode } : {}),
    ...(message !== undefined ? { message } : {}),
    ...(resolvedTotal !== undefined ? { total: resolvedTotal } : {}),
  };
  const hasData = Object.prototype.hasOwnProperty.call(responseInput, "data");
  const responseTotal = getTotal(responseInput, responseInput.total);
  const result = {
    success: true,
    statusCode: responseInput.statusCode ?? STATUS_CODE.OK,
    message: responseInput.message ?? "Request successful",
    data: hasData ? (responseInput.data as T) : {},
    ...(responseTotal !== undefined ? { total: responseTotal } : {}),
    timestamp: new Date().toISOString(),
  } as ResponseResult<T>;

  return result;
}
