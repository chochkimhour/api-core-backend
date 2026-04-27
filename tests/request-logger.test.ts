import { beforeEach, describe, expect, it } from "vitest";
import {
  asyncHandler,
  configureLogger,
  formatRequestLog,
  logger,
  requestLogger,
  resetLoggerConfig,
} from "../src";

describe("request logger middleware", () => {
  beforeEach(() => {
    resetLoggerConfig();
  });

  it("formats request logs", () => {
    expect(
      formatRequestLog({
        projectName: "my-api",
        method: "GET",
        url: "/users?max=10",
        statusCode: 200,
        durationMs: 12,
        timestamp: "2026-04-27 16:00:00",
        requestFrom: "127.0.0.1",
        userAgent: "vitest",
        sourceFile: "users.controller.ts",
        sourceMethod: "findAll",
        user: "kimhour",
      }),
    ).toBe(
      '[my-api] 2026-04-27 16:00:00 INFO GET /users?max=10 200 12ms file=users.controller.ts method=findAll by=kimhour from=127.0.0.1 ua="vitest"',
    );
  });

  it("marks client and server errors", () => {
    expect(
      formatRequestLog({
        projectName: "my-api",
        method: "GET",
        url: "/missing",
        statusCode: 404,
        durationMs: 3,
        timestamp: "2026-04-27 16:00:00",
      }),
    ).toBe(
      "[my-api] 2026-04-27 16:00:00 WARN GET /missing 404 3ms file=unknown method=GET by=system",
    );

    expect(
      formatRequestLog({
        projectName: "my-api",
        method: "POST",
        url: "/users",
        statusCode: 500,
        durationMs: 8,
        timestamp: "2026-04-27 16:00:00",
      }),
    ).toBe(
      "[my-api] 2026-04-27 16:00:00 ERROR POST /users 500 8ms file=unknown method=POST by=system",
    );
  });

  it("logs when the response finishes", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;
    const middleware = logger({
      projectName: "my-api",
      sourceFile: "users.controller.ts",
      sourceMethod: "findAll",
      log: (message) => logs.push(message),
    });

    middleware(
      {
        ip: "127.0.0.1",
        method: "GET",
        originalUrl: "/users",
        user: { username: "kimhour" },
      },
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
      /^\[my-api\] \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} INFO GET \/users 200 \d+ms file=users\.controller\.ts method=findAll by=kimhour$/,
    );
  });

  it("automatically logs route file and handler method", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    function findAllUsers() {
      return undefined;
    }

    const middleware = logger({
      projectName: "my-api",
      log: (message) => logs.push(message),
    });

    middleware(
      {
        method: "GET",
        originalUrl: "/api/users?max=10",
        route: {
          path: "/users",
          stack: [{ handle: findAllUsers }],
        },
      },
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
      /^\[my-api\] \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} INFO GET \/api\/users\?max=10 200 \d+ms file=users\.controller\.ts method=findAllUsers by=system$/,
    );
  });

  it("keeps async handler names available for route logs", () => {
    function findAllUsers() {
      return undefined;
    }

    expect(asyncHandler(findAllUsers).name).toBe("findAllUsers");
  });

  it("uses mounted router path for controller file on root routes", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    function findAllUsers() {
      return undefined;
    }

    const middleware = logger({
      projectName: "my-api",
      log: (message) => logs.push(message),
    });

    middleware(
      {
        method: "GET",
        originalUrl: "/api/users",
        baseUrl: "/api/users",
        route: {
          path: "/",
          stack: [{ handle: findAllUsers }],
        },
      },
      {
        statusCode: 200,
        on: (_event, listener) => {
          finishListener = listener;
        },
      },
      () => undefined,
    );

    finishListener?.();

    expect(logs[0]).toMatch(/file=users\.controller\.ts method=findAllUsers/);
  });

  it("can still include request source when enabled", () => {
    expect(
      formatRequestLog({
        projectName: "my-api",
        method: "GET",
        url: "/users",
        statusCode: 200,
        durationMs: 12,
        timestamp: "2026-04-27 16:00:00",
        requestFrom: "127.0.0.1",
      }),
    ).toBe(
      "[my-api] 2026-04-27 16:00:00 INFO GET /users 200 12ms file=unknown method=GET by=system from=127.0.0.1",
    );
  });

  it("uses global logger config without repeating options", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    function findAllUsers() {
      return undefined;
    }

    configureLogger({
      projectName: "my-api",
      getUser: (req) =>
        typeof req.user === "object" &&
        req.user !== null &&
        "username" in req.user &&
        typeof req.user.username === "string"
          ? req.user.username
          : undefined,
      log: (message) => logs.push(message),
    });

    const middleware = logger();

    middleware(
      {
        method: "GET",
        originalUrl: "/api/users",
        user: { username: "kimhour" },
        route: {
          path: "/users",
          stack: [{ handle: findAllUsers }],
        },
      },
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
      /^\[my-api\] \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} INFO GET \/api\/users 200 \d+ms file=users\.controller\.ts method=findAllUsers by=kimhour$/,
    );
  });

  it("allows local logger options to override global config", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    configureLogger({
      projectName: "global-api",
      log: (message) => logs.push(message),
    });

    const middleware = logger({ projectName: "local-api" });

    middleware(
      { method: "GET", originalUrl: "/health" },
      {
        statusCode: 200,
        on: (_event, listener) => {
          finishListener = listener;
        },
      },
      () => undefined,
    );

    finishListener?.();

    expect(logs[0]).toContain("[local-api]");
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
