# api-core-backend

![npm version](https://img.shields.io/npm/v/api-core-backend?style=flat-square)
![license](https://img.shields.io/npm/l/api-core-backend?style=flat-square)
![npm downloads](https://img.shields.io/npm/dm/api-core-backend?style=flat-square)
![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square)
![types](https://img.shields.io/badge/types-TypeScript-blue?style=flat-square)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)
[![source](https://img.shields.io/badge/source-GitHub-black?style=flat-square)](https://github.com/chochkimhour/api-core-backend)

REST API helpers for Node.js, Express, and TypeScript.

`api-core-backend` is a small utility package for building clean and consistent REST APIs. It gives backend projects a standard way to send JSON responses, handle errors, read common query parameters, paginate data with `max` and `offset`, log requests, and generate optional Swagger/OpenAPI documentation.

Use it when you want your API controllers to stay focused on business logic instead of repeating the same response, pagination, error, and middleware code in every project.

## Why Use It

- Keeps API responses consistent across endpoints and projects
- Reduces repeated controller, pagination, error, and logging code
- Provides safe defaults for common REST API patterns
- Works well in JavaScript and TypeScript projects
- Keeps runtime dependencies at zero

## Use With

### Languages And Runtimes

- JavaScript
- TypeScript
- Node.js
- Bun runtime
- Deno runtime with npm package support

### Frameworks

- Express
- NestJS with Express adapter
- Fastify
- Koa
- Hono
- Restify
- AdonisJS
- FeathersJS
- Serverless API routes
- Any Node.js framework that can use plain helper functions

Express middleware helpers such as `logger()`, `asyncHandler()`, `notFoundMiddleware`, and `errorMiddleware` are designed for Express-compatible `req`, `res`, and `next` handlers. Response, pagination, filter, search, sorting, status code, error class, and Swagger helpers can be used in any Node.js backend.

## Features

- Consistent success, error, validation, and paginated JSON responses
- Simple `max` and `offset` pagination with automatic `total`
- Query helpers for filters, search, and sorting
- HTTP status constants and typed HTTP error classes
- Express helpers for async handlers, not found routes, and error handling
- Request logger with project, file, method, status, duration, user, and safe JSON output
- Optional Swagger/OpenAPI helpers for docs
- TypeScript types, ESM and CommonJS builds, and no runtime dependencies

## Installation

```bash
npm install api-core-backend
```

Optional Swagger dependencies:

```bash
npm install swagger-ui-express swagger-jsdoc
```

## Requirements

- Node.js `>=18`
- Express or an Express-compatible framework for middleware helpers
- TypeScript supported out of the box

## Quick Start

```js
import express from "express";
import {
  asyncHandler,
  configureLogger,
  errorMiddleware,
  getFilters,
  getPagination,
  getSearch,
  getSorting,
  logger,
  notFoundMiddleware,
  paginate,
  response,
  statusCode,
} from "api-core-backend";

const app = express();

app.use(express.json());

configureLogger({
  projectName: "my-api",
  getUser: (req) => req.user?.username,
});

app.use(logger());

const users = [
  { id: "1", name: "Sokha", status: "ACTIVE", role: "ADMIN" },
  { id: "2", name: "Dara", status: "ACTIVE", role: "USER" },
  { id: "3", name: "Sophea", status: "INACTIVE", role: "USER" },
];

async function findAllUsers(req, res) {
  const pagination = getPagination(req.query);
  const filters = getFilters(req.query, ["status", "role"]);
  const search = getSearch(req.query);
  const sorting = getSorting(req.query);

  const filteredUsers = users
    .filter((user) => (filters.status ? user.status === filters.status : true))
    .filter((user) => (filters.role ? user.role === filters.role : true))
    .filter((user) =>
      search.keyword
        ? user.name.toLowerCase().includes(search.keyword.toLowerCase())
        : true,
    )
    .sort((a, b) => {
      if (!sorting.sortBy) return 0;

      const left = String(a[sorting.sortBy] ?? "");
      const right = String(b[sorting.sortBy] ?? "");

      return sorting.sortOrder === "desc"
        ? right.localeCompare(left)
        : left.localeCompare(right);
    });

  const result = paginate(filteredUsers, pagination);

  return res.json(
    response(result, statusCode.OK, "Users fetched successfully"),
  );
}

app.get("/api/users", asyncHandler(findAllUsers));

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(3000);
```

## Pagination

Pagination uses `max` and `offset`.

```text
GET /api/users?max=10&offset=0
```

```js
import { getPagination, paginate, response } from "api-core-backend";

const pagination = getPagination(req.query);
const result = paginate(users, pagination);

return res.json(response(result));
```

Defaults:

```json
{
  "max": 10,
  "offset": 0
}
```

Configure limits:

```js
const pagination = getPagination(req.query, {
  defaultMax: 20,
  maxMax: 100,
});
```

Invalid values fall back to defaults. Requested `max` is capped by `maxMax`.

## Logger

Configure once during application bootstrap:

```js
import { configureLogger, logger } from "api-core-backend";

configureLogger({
  projectName: "my-api",
  getUser: (req) => req.user?.username,
});

app.use(logger());
```

Example output:

```text
[my-api] | 2026-04-27 16:00:00 | INFO GET /api/users 200 6ms | file=index.js | method=findAllUsers | by=anonymous
```

Logger behavior:

- Uses Cambodia local time in `YYYY-MM-DD HH:mm:ss` format
- Uses the running entry file when available, such as `index.js`
- Falls back to route-based file inference, such as `users.controller.ts`
- Infers handler method names from named Express route handlers
- Redacts sensitive request and response fields
- Hides request source by default
- Supports global and per-middleware options

Logger options:

```js
configureLogger({
  projectName: "my-api",
  includeRequestFrom: false,
  includeUserAgent: false,
  includeRouteContext: true,
  includeRequestData: false,
  includeResponseData: true,
  maxRequestDataLength: 500,
  maxResponseDataLength: 2000,
  redactFields: ["password", "token", "authorization", "secret", "apiKey"],
  controllerFileSuffix: ".controller.ts",
  getUser: (req) => req.user?.username,
});
```

`requestLogger()` remains available as an alias for `logger()`.

For a single-file app such as `index.js`, run your app with `node index.js` or `nodemon index.js` and use named route handlers for clean log output:

```js
configureLogger({
  projectName: "my-api",
});

async function findAllUsers(req, res) {
  return res.json(response(users));
}

app.get("/api/users", asyncHandler(findAllUsers));
```

Example output:

```text
[my-api] | 2026-04-28 08:55:59 | INFO GET /api/users 200 29ms | file=index.js | method=findAllUsers | by=anonymous
***response={"success":true,"statusCode":200,"message":"OK","data":[{"id":"1","name":"Sokha","status":"ACTIVE","role":"ADMIN"},{"id":"2","name":"Dara","status":"ACTIVE","role":"USER"},{"id":"3","name":"Sophea","status":"INACTIVE","role":"USER"}],"total":3,"timestamp":"2026-04-28 08:55:59"}***
```

If you want to force a file name, set `sourceFile`:

```js
configureLogger({
  projectName: "my-api",
  sourceFile: "index.js",
});
```

## Responses

Short response:

```js
return res.json(response(users));
```

Full response with status code and message:

```js
return res.json(response(users, statusCode.OK, "Users fetched successfully"));
```

Paginated response:

```js
const pagination = getPagination(req.query);
const result = paginate(filteredUsers, pagination);

return res.json(response(result, statusCode.OK, "Users fetched successfully"));
```

Other response helpers:

```js
import {
  errorResponse,
  paginatedResponse,
  response,
  successResponse,
  validationErrorResponse,
} from "api-core-backend";

successResponse({ message: "Done", data: { id: 1 } });
errorResponse({ message: "Something went wrong", code: "ERROR_CODE" });
validationErrorResponse({
  message: "Validation failed",
  errors: [{ field: "email", message: "Email is required" }],
});
paginatedResponse({
  message: "Users fetched successfully",
  data: users,
  max: 10,
  offset: 0,
  total: 100,
});
```

Success response shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": { "id": 1, "name": "Sokha" },
  "total": 1,
  "timestamp": "2026-04-27 21:59:03"
}
```

## Query Helpers

```js
import { getFilters, getSearch, getSorting } from "api-core-backend";

const filters = getFilters(req.query, ["status", "role"]);
const search = getSearch(req.query);
const sorting = getSorting(req.query);
```

Supported query parameters:

```text
?max=10&offset=0
?status=ACTIVE&role=USER
?q=sokha
?search=sokha
?sortBy=name&sortOrder=desc
```

## Error Handling

```js
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  asyncHandler,
  errorMiddleware,
  notFoundMiddleware,
} from "api-core-backend";

app.get("/api/users/:id", asyncHandler(findUserById));

throw new NotFoundError("User not found");
throw new BadRequestError("Name is required");
throw new UnauthorizedError("Please login first");
throw new ForbiddenError("Permission denied");
throw new ConflictError("Email already exists");
throw new ValidationError("Validation failed", [
  { field: "email", message: "Email is required" },
]);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

## Status Codes

```js
import { HTTP_STATUS, statusCode } from "api-core-backend";

statusCode.OK; // 200
statusCode.CREATED; // 201
statusCode.BAD_REQUEST; // 400
statusCode.UNAUTHORIZED; // 401
statusCode.FORBIDDEN; // 403
statusCode.NOT_FOUND; // 404
statusCode.CONFLICT; // 409
statusCode.UNPROCESSABLE_ENTITY; // 422
statusCode.INTERNAL_SERVER_ERROR; // 500

HTTP_STATUS.OK; // 200
```

## Swagger

```js
import express from "express";
import { setupSwaggerDocs } from "api-core-backend/swagger";

const app = express();

await setupSwaggerDocs(app, {
  path: "/api-docs",
  title: "My API",
  version: "1.0.0",
  description: "REST API documentation",
  servers: [{ url: "http://localhost:3000" }],
  tags: [{ name: "Users" }],
});
```

Create a spec without mounting Express:

```js
import { createSwaggerSpec } from "api-core-backend/swagger";

const spec = createSwaggerSpec({
  title: "My API",
  version: "1.0.0",
  servers: [{ url: "http://localhost:3000" }],
});
```

## API Reference

### Main Package

| Export                      | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `response()`                | Standard success response with `total`    |
| `successResponse()`         | Success response helper                   |
| `errorResponse()`           | Error response helper                     |
| `validationErrorResponse()` | Validation error response helper          |
| `paginatedResponse()`       | Paginated response helper                 |
| `getPagination()`           | Reads `max` and `offset`                  |
| `paginate()`                | Slices arrays and returns full total      |
| `getPaginationMeta()`       | Builds `max`/`offset` pagination metadata |
| `getFilters()`              | Keeps allowed filter fields               |
| `getSearch()`               | Reads `q` or `search`                     |
| `getSorting()`              | Reads `sortBy` and `sortOrder`            |
| `asyncHandler()`            | Wraps async route handlers                |
| `notFoundMiddleware`        | Handles unmatched routes                  |
| `errorMiddleware`           | Sends standard JSON errors                |
| `configureLogger()`         | Sets global logger options                |
| `logger()`                  | Request logger middleware                 |
| `requestLogger()`           | Alias for `logger()`                      |
| `resetLoggerConfig()`       | Clears global logger config               |
| `statusCode`                | HTTP status constants                     |
| `HTTP_STATUS`               | HTTP status constants                     |

### Swagger Package

Import from `api-core-backend/swagger`.

| Export                   | Purpose                      |
| ------------------------ | ---------------------------- |
| `createSwaggerSpec()`    | Creates an OpenAPI spec      |
| `setupSwaggerDocs()`     | Mounts Swagger UI            |
| `swaggerRoute()`         | Creates one route definition |
| `swaggerRoutes()`        | Creates route definitions    |
| `swaggerSchemas`         | Reusable OpenAPI schemas     |
| `swaggerQueryParameters` | Reusable query parameters    |

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
