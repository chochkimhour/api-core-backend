import { describe, expect, it } from "vitest";
import { formatRequestLog, requestLogger } from "../src";

describe("request logger middleware", () => {
  it("formats request logs", () => {
    expect(
      formatRequestLog({
        method: "GET",
        url: "/users?max=10",
        statusCode: 200,
        durationMs: 12,
        ip: "127.0.0.1",
        userAgent: "vitest",
      }),
    ).toBe(
      '[api-core-backend] INFO GET /users?max=10 200 12ms ip=127.0.0.1 ua="vitest"',
    );
  });

  it("marks client and server errors", () => {
    expect(
      formatRequestLog({
        method: "GET",
        url: "/missing",
        statusCode: 404,
        durationMs: 3,
      }),
    ).toBe("[api-core-backend] WARN GET /missing 404 3ms");

    expect(
      formatRequestLog({
        method: "POST",
        url: "/users",
        statusCode: 500,
        durationMs: 8,
      }),
    ).toBe("[api-core-backend] ERROR POST /users 500 8ms");
  });

  it("logs when the response finishes", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;
    const middleware = requestLogger({
      logger: (message) => logs.push(message),
    });

    middleware(
      { method: "GET", originalUrl: "/users" },
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
      /^\[api-core-backend\] INFO GET \/users 200 \d+ms$/,
    );
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
