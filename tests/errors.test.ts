import { describe, expect, it } from "vitest";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  HTTP_STATUS,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from "../src";

describe("error classes", () => {
  it("creates a base app error", () => {
    const error = new AppError({
      message: "Failed",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: "FAILED",
      details: { id: 1 }
    });

    expect(error).toMatchObject({
      message: "Failed",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: "FAILED",
      details: { id: 1 },
      isOperational: true
    });
  });

  it("creates http errors with expected status codes", () => {
    expect(new BadRequestError().statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(new UnauthorizedError().statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(new ForbiddenError().statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    expect(new NotFoundError().statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    expect(new ConflictError().statusCode).toBe(HTTP_STATUS.CONFLICT);
    expect(new ValidationError().statusCode).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
  });
});
