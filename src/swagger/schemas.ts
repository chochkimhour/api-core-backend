import type { OpenApiSchema } from "./types";

const timestampSchema: OpenApiSchema = {
  type: "string",
  example: "2026-04-27 21:59:03",
  description: "Cambodia local date and time in YYYY-MM-DD HH:mm:ss format.",
};

export const successResponseSchema: OpenApiSchema = {
  type: "object",
  required: ["success", "statusCode", "message", "data", "total", "timestamp"],
  properties: {
    success: { type: "boolean", example: true },
    statusCode: { type: "integer", example: 200 },
    message: { type: "string", example: "Request successful" },
    data: {
      description: "Response payload.",
      nullable: true,
    },
    total: {
      type: "integer",
      example: 20,
      description: "Total returned records. Single-object responses use 1.",
    },
    timestamp: timestampSchema,
  },
};

export const errorResponseSchema: OpenApiSchema = {
  type: "object",
  required: ["success", "message", "error", "timestamp"],
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Something went wrong" },
    error: { type: "string", example: "INTERNAL_SERVER_ERROR" },
    details: {
      description: "Optional error details.",
      nullable: true,
    },
    timestamp: timestampSchema,
  },
};

export const validationErrorResponseSchema: OpenApiSchema = {
  type: "object",
  required: ["success", "message", "errors", "timestamp"],
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Validation failed" },
    errors: {
      type: "array",
      items: {
        type: "object",
        required: ["field", "message"],
        properties: {
          field: { type: "string", example: "email" },
          message: { type: "string", example: "Email is required" },
        },
      },
    },
    timestamp: timestampSchema,
  },
};

export const paginationMetadataSchema: OpenApiSchema = {
  type: "object",
  required: ["max", "offset", "total", "hasNextPage", "hasPreviousPage"],
  properties: {
    max: { type: "integer", example: 10 },
    offset: { type: "integer", example: 0 },
    total: { type: "integer", example: 100 },
    hasNextPage: { type: "boolean", example: true },
    hasPreviousPage: { type: "boolean", example: false },
  },
};

export const paginatedResponseSchema: OpenApiSchema = {
  allOf: [
    successResponseSchema,
    {
      type: "object",
      required: ["total"],
      properties: {
        total: {
          type: "integer",
          example: 100,
          description: "Total records before pagination.",
        },
      },
    },
  ],
};

export const swaggerSchemas = {
  SuccessResponse: successResponseSchema,
  ErrorResponse: errorResponseSchema,
  ValidationErrorResponse: validationErrorResponseSchema,
  PaginatedResponse: paginatedResponseSchema,
  PaginationMeta: paginationMetadataSchema,
} as const;
