import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super({ message, statusCode: HTTP_STATUS.BAD_REQUEST, code: "BAD_REQUEST", details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super({ message, statusCode: HTTP_STATUS.UNAUTHORIZED, code: "UNAUTHORIZED", details });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super({ message, statusCode: HTTP_STATUS.FORBIDDEN, code: "FORBIDDEN", details });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", details?: unknown) {
    super({ message, statusCode: HTTP_STATUS.NOT_FOUND, code: "NOT_FOUND", details });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super({ message, statusCode: HTTP_STATUS.CONFLICT, code: "CONFLICT", details });
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super({
      message,
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      code: "VALIDATION_ERROR",
      details
    });
  }
}
