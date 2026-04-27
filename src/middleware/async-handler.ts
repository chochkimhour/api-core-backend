export type AsyncRequestHandler<
  TRequest = unknown,
  TResponse = unknown,
  TNext = unknown,
> = (req: TRequest, res: TResponse, next: TNext) => Promise<unknown> | unknown;

/** Wraps async route handlers and forwards rejected promises to next(). */
export function asyncHandler<TRequest = unknown, TResponse = unknown>(
  handler: AsyncRequestHandler<TRequest, TResponse, (error?: unknown) => void>,
) {
  const wrapped = (
    req: TRequest,
    res: TResponse,
    next: (error?: unknown) => void,
  ) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

  if (handler.name) {
    Object.defineProperty(wrapped, "name", {
      value: handler.name,
      configurable: true,
    });
  }

  return wrapped;
}
