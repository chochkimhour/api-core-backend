import { describe, expect, it } from "vitest";
import {
  errorResponse,
  paginatedResponse,
  successResponse,
  validationErrorResponse,
} from "../src";

describe("response helpers", () => {
  it("creates a success response", () => {
    const response = successResponse({
      message: "Users fetched successfully",
      data: [{ id: 1 }],
    });

    expect(response).toMatchObject({
      success: true,
      message: "Users fetched successfully",
      data: [{ id: 1 }],
    });
    expect(response.timestamp).toEqual(expect.any(String));
  });

  it("preserves explicit null data in success responses", () => {
    const response = successResponse({ data: null });

    expect(response.data).toBeNull();
  });

  it("creates an error response", () => {
    const response = errorResponse({
      message: "Something failed",
      code: "FAILED",
      details: { reason: "test" },
    });

    expect(response).toMatchObject({
      success: false,
      message: "Something failed",
      error: {
        code: "FAILED",
        details: { reason: "test" },
      },
    });
  });

  it("creates a validation error response", () => {
    const response = validationErrorResponse({
      errors: [{ field: "email", message: "Email is required" }],
    });

    expect(response).toMatchObject({
      success: false,
      message: "Validation failed",
      errors: [{ field: "email", message: "Email is required" }],
    });
  });

  it("creates a paginated response", () => {
    const response = paginatedResponse({
      data: [1, 2, 3],
      page: 1,
      limit: 10,
      total: 25,
    });

    expect(response).toMatchObject({
      success: true,
      message: "Data fetched successfully",
      data: [1, 2, 3],
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      },
    });
  });
});
