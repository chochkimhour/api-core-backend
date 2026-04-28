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
        responseData: '{"success":true}',
      }),
    ).toBe(
      '[my-api] | 2026-04-27 16:00:00 | INFO GET /users?max=10 200 12ms | file=users.controller.ts | method=findAll | by=kimhour | from=127.0.0.1 | ua="vitest"\n***response={"success":true}***',
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
      "[my-api] | 2026-04-27 16:00:00 | WARN GET /missing 404 3ms | file=unknown | method=GET | by=anonymous",
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
      "[my-api] | 2026-04-27 16:00:00 | ERROR POST /users 500 8ms | file=unknown | method=POST | by=anonymous",
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
        json: (body) => body,
      },
      () => undefined,
    );

    finishListener?.();

    expect(logs[0]).toMatch(
      /^\[my-api\] \| \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \| INFO GET \/users 200 \d+ms \| file=users\.controller\.ts \| method=findAll \| by=kimhour$/,
    );
  });

  it("logs response json on the next line", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;
    const responseBody = {
      success: true,
      statusCode: 200,
      message: "Users fetched successfully",
      data: [{ id: "1", name: "Sokha" }],
      total: 1,
      timestamp: "2026-04-27 22:25:26",
    };
    const middleware = logger({
      projectName: "my-api",
      sourceFile: "users.controller.ts",
      sourceMethod: "findAllUsers",
      log: (message) => logs.push(message),
    });

    const res = {
      statusCode: 200,
      on: (_event: "finish", listener: () => void) => {
        finishListener = listener;
      },
      json: (body: unknown) => body,
    };

    middleware(
      {
        method: "GET",
        originalUrl: "/api/users",
      },
      res,
      () => undefined,
    );

    res.json(responseBody);
    finishListener?.();

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatch(
      /^\[my-api\] \| \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \| INFO GET \/api\/users 200 \d+ms \| file=users\.controller\.ts \| method=findAllUsers \| by=anonymous\n\*\*\*response=\{"success":true,"statusCode":200,"message":"Users fetched successfully","data":\[\{"id":"1","name":"Sokha"\}\],"total":1,"timestamp":"2026-04-27 22:25:26"\}\*\*\*$/,
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
      /^\[my-api\] \| \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \| INFO GET \/api\/users\?max=10 200 \d+ms \| file=users\.controller\.ts \| method=findAllUsers \| by=anonymous$/,
    );
  });

  it("uses the resource segment for full app route paths", () => {
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
        route: {
          path: "/api/users",
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

    expect(logs[0]).toMatch(
      /file=users\.controller\.ts \| method=findAllUsers/,
    );
  });

  it("uses the runtime entry file before route-based file inference", () => {
    const originalProcess = (globalThis as { process?: unknown }).process;
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    Object.defineProperty(globalThis, "process", {
      value: {
        argv: ["node", "D:\\apps\\my-api\\index.js"],
        env: {},
      },
      configurable: true,
    });

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
        route: {
          path: "/api/users",
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

    Object.defineProperty(globalThis, "process", {
      value: originalProcess,
      configurable: true,
    });

    expect(logs[0]).toMatch(/file=index\.js \| method=findAllUsers/);
  });

  it("falls back to the HTTP method for anonymous async handlers", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    const middleware = logger({
      projectName: "my-api",
      log: (message) => logs.push(message),
    });
    const anonymousHandler = asyncHandler(async () => undefined);

    middleware(
      {
        method: "GET",
        originalUrl: "/api/users",
        route: {
          path: "/api/users",
          stack: [{ handle: anonymousHandler }],
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

    expect(logs[0]).toMatch(/file=users\.controller\.ts \| method=GET/);
  });

  it("logs redacted request body json", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    function updateUser() {
      return undefined;
    }

    const middleware = logger({
      projectName: "my-api",
      includeRequestData: true,
      includeResponseData: false,
      log: (message) => logs.push(message),
    });

    middleware(
      {
        method: "PATCH",
        originalUrl: "/api/users/2",
        body: { name: "Dara", password: "secret" },
        route: {
          path: "/users/:id",
          stack: [{ handle: updateUser }],
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

    expect(logs[0]).toMatch(
      /\nrequest=\{"name":"Dara","password":"\[REDACTED\]"\}$/,
    );
  });

  it("does not log request body for GET requests", () => {
    const logs: string[] = [];
    let finishListener: (() => void) | undefined;

    function findAllUsers() {
      return undefined;
    }

    const middleware = logger({
      projectName: "my-api",
      includeRequestData: true,
      includeResponseData: false,
      log: (message) => logs.push(message),
    });

    middleware(
      {
        method: "GET",
        originalUrl: "/api/users",
        body: { videoName: "summer_vacation.mp4", userId: "user_123" },
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

    expect(logs[0]).not.toContain("request=");
    expect(logs[0]).not.toContain("videoName");
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

    expect(logs[0]).toMatch(
      /file=users\.controller\.ts \| method=findAllUsers/,
    );
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
      "[my-api] | 2026-04-27 16:00:00 | INFO GET /users 200 12ms | file=unknown | method=GET | by=anonymous | from=127.0.0.1",
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
      /^\[my-api\] \| \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \| INFO GET \/api\/users 200 \d+ms \| file=users\.controller\.ts \| method=findAllUsers \| by=kimhour$/,
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
