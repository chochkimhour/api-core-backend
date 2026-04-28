import { describe, expect, it } from "vitest";
import {
  errorResponse,
  paginatedResponse,
  response,
  statusCode,
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
      total: 1,
    });
    expect(response.timestamp).toEqual(expect.any(String));
    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it("preserves explicit null data in success responses", () => {
    const response = successResponse({ data: null });

    expect(response.data).toBeNull();
    expect(response.total).toBe(0);
  });

  it("creates object success responses with total", () => {
    const user = { id: 1, name: "Sokha" };

    expect(successResponse({ data: user })).toMatchObject({
      data: user,
      total: 1,
    });
  });

  it("creates a simple response from data", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response(users);

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Request successful",
      data: users,
      total: 1,
    });
    expect(result).not.toHaveProperty("pagination");
    expect(result).not.toHaveProperty("error");
  });

  it("creates a get-by-id response with total", () => {
    const user = { id: 1, name: "Sokha", status: "ACTIVE" };
    const result = response(user);

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Request successful",
      data: user,
      total: 1,
    });
  });

  it("creates CRUD object responses with total", () => {
    const user = { id: 1, name: "Sokha", status: "ACTIVE" };

    expect(response(user, statusCode.CREATED, "User created")).toMatchObject({
      statusCode: 201,
      message: "User created",
      data: user,
      total: 1,
    });

    expect(response(user, statusCode.OK, "User updated")).toMatchObject({
      statusCode: 200,
      message: "User updated",
      data: user,
      total: 1,
    });
  });

  it("creates empty responses with zero total", () => {
    expect(response()).toMatchObject({
      data: undefined,
      total: 0,
    });

    expect(response(null)).toMatchObject({
      data: null,
      total: 0,
    });
  });

  it("creates a simple response from data and total", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response(users, 100);

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Request successful",
      data: users,
      total: 100,
    });
    expect(result).not.toHaveProperty("pagination");
    expect(result).not.toHaveProperty("error");
  });

  it("creates a simple response from data and message", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response(users, "ok");

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "ok",
      data: users,
      total: 1,
    });
    expect(result).not.toHaveProperty("pagination");
  });

  it("creates a simple response from data, message, and total", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response(users, "Users fetched successfully", 100);

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: users,
      total: 100,
    });
    expect(result).not.toHaveProperty("pagination");
  });

  it("creates a simple response from data, status code, and message", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response(users, statusCode.OK, "Users fetched successfully");

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: users,
      total: 1,
    });
    expect(result).not.toHaveProperty("pagination");
  });

  it("creates a simple response from data, status code, message, and total", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response(
      users,
      statusCode.OK,
      "Users fetched successfully",
      100,
    );

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: users,
      total: 100,
    });
    expect(result).not.toHaveProperty("pagination");
  });

  it("creates a simple response from message, data, and total", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response({
      message: "Users fetched successfully",
      data: users,
      total: 100,
    });

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: users,
      total: 100,
    });
    expect(result).not.toHaveProperty("pagination");
    expect(result).not.toHaveProperty("error");
  });

  it("creates a simple response with automatic total from input data", () => {
    const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];
    const result = response({
      message: "Users fetched successfully",
      data: users,
    });

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: users,
      total: 1,
    });
    expect(result).not.toHaveProperty("pagination");
  });

  it("creates a simple response using total from an object", () => {
    const users = {
      data: [{ id: 1, name: "Sokha", status: "ACTIVE" }],
      total: 100,
    };
    const result = response(users);

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Request successful",
      data: users.data,
      total: 100,
    });
    expect(result).not.toHaveProperty("pagination");
  });

  it("creates a simple response using object total with status code and message", () => {
    const users = {
      data: [{ id: 1, name: "Sokha", status: "ACTIVE" }],
      total: 100,
    };
    const result = response(users, statusCode.OK, "Users fetched successfully");

    expect(result).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: users.data,
      total: 100,
    });
    expect(result).not.toHaveProperty("pagination");
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
      error: "FAILED",
      details: { reason: "test" },
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
      max: 10,
      offset: 0,
      total: 25,
    });

    expect(response).toMatchObject({
      success: true,
      message: "Data fetched successfully",
      data: [1, 2, 3],
      total: 25,
    });
    expect(response).not.toHaveProperty("pagination");
    expect(response).not.toHaveProperty("error");
  });

  it("creates a paginated response from nested meta", () => {
    const response = paginatedResponse({
      message: "Users fetched successfully",
      data: [{ id: 1 }],
      meta: {
        max: 10,
        offset: 0,
        total: 1,
      },
    });

    expect(response).toMatchObject({
      success: true,
      message: "Users fetched successfully",
      data: [{ id: 1 }],
      total: 1,
    });
    expect(response).not.toHaveProperty("pagination");
    expect(response).not.toHaveProperty("offset");
    expect(response).not.toHaveProperty("error");
  });
});
