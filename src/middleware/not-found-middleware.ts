import { NotFoundError } from "../errors/http-errors";

/** Express-compatible middleware that forwards unmatched routes as NotFoundError. */
export function notFoundMiddleware(
  req: { originalUrl?: string; url?: string },
  _res: unknown,
  next: (error?: unknown) => void,
) {
  const path = req.originalUrl ?? req.url ?? "unknown route";
  next(new NotFoundError(`Route not found: ${path}`));
}
