import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../errors/app-error";
import { errorResponse } from "../responses/error-response";

interface ErrorResponseLike {
  headersSent?: boolean;
  status(code: number): ErrorResponseLike;
  json(body: unknown): unknown;
}

type NextFunctionLike = (error?: unknown) => void;

/** Express-compatible error middleware that emits standard JSON errors. */
export function errorMiddleware(
  error: unknown,
  _req: unknown,
  res: ErrorResponseLike,
  next: NextFunctionLike,
) {
  if (res.headersSent) {
    return next(error);
  }

  const appError = error instanceof AppError ? error : null;
  const statusCode = appError?.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json(
    errorResponse({
      message: appError?.message ?? "Something went wrong",
      code: appError?.code ?? "INTERNAL_SERVER_ERROR",
      details: appError?.details ?? null,
    }),
  );
}
