import { describe, expect, it } from "vitest";
import { formatRequestLog, logger, requestLogger } from "../src";

describe("request logger middleware", () => {
  it("formats request logs", () => {
    expect(
      formatRequestLog({
        method: "GET",
        url: "/users?max=10",
        statusCode: 200,
        durationMs: 12,
        timestamp: "2026-04-27T09:00:00.000Z",
        requestFrom: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).toBe(
      '[api-core-backend] 2026-04-27T09:00:00.000Z INFO GET /users?max=10 200 12ms from=127.0.0.1 ua="vitest"',
    );
  });

  it("marks client and server errors", () => {
    expect(
      formatRequestLog({
        method: "GET",
        url: "/missing",
        statusCode: 404,
        durationMs: 3,
        timestamp: "2026-04-27T09:00:00.000Z",
      }),
    ).toBe(
      "[api-core-backend] 2026-04-27T09:00:00.000Z WARN GET /missing 404 3ms",
    );

    expect(
      formatRequestLog({
        method: "POST",
        url: "/users",
        statusCode: 500,
        durationMs: 8,
        timestamp: "2026-04-27T09:00:00.000Z",
      }),
    ).toBe(
      "[api-core-backend] 2026-04-27T09:00:00.000Z ERROR POST /users 500 8ms",
    );
  });

  it("logs when the response finishes", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;
    const middleware = logger({
      log: (message) => logs.push(message),
    });

    middleware(
      { ip: "127.0.0.1", method: "GET", originalUrl: "/users" },
      {
        statusCode: 200,
        on: (_event, listener) => {
          finishListener = listener;
        },
      },
      () => undefined,
    );

    finishListener?.();

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatch(
      /^\[api-core-backend\] \d{4}-\d{2}-\d{2}T.+ INFO GET \/users 200 \d+ms from=127\.0\.0\.1$/,
    );
  });

  it("keeps requestLogger as an alias", () => {
    expect(requestLogger).toBe(logger);
  });

  it("skips logging when disabled", () => {
    const logs: string[] = [];
    const middleware = requestLogger({
      enabled: false,
      logger: (message) => logs.push(message),
    });
    let nextCalled = false;

    middleware(
      { method: "GET", originalUrl: "/users" },
      { statusCode: 200 },
      () => {
        nextCalled = true;
      },
    );

    expect(nextCalled).toBe(true);
    expect(logs).toEqual([]);
  });
});
