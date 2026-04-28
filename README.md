# api-core-backend

[![npm package](https://img.shields.io/badge/npm-api--core--backend-cb3837)](https://www.npmjs.com/package/api-core-backend)
![license](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![typescript](https://img.shields.io/badge/types-included-blue)

REST API helpers for Node.js, Express, and TypeScript.

`api-core-backend` is a small utility package for building clean and consistent REST APIs. It gives backend projects a standard way to send JSON responses, handle errors, read common query parameters, paginate data with `max` and `offset`, log requests, and generate optional Swagger/OpenAPI documentation.

Use it when you want your API controllers to stay focused on business logic instead of repeating the same response, pagination, error, and middleware code in every project.

## Why Use It

- Standard response format across all endpoints
- Simple `max`/`offset` pagination for list APIs
- Reusable filter, search, and sorting helpers
- Typed HTTP error classes and error middleware
- Async route handler wrapper for Express controllers
- Request logger with route, status, duration, user, and response data
- Optional Swagger/OpenAPI helpers for API documentation
- TypeScript types included
- No runtime dependencies

## Use With

- Node.js APIs
- Express applications
- Express-compatible frameworks
- JavaScript or TypeScript backends
- REST APIs that need consistent responses, pagination, errors, logs, and docs

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

app.get(
  "/api/users",
  asyncHandler(async (req, res) => {
    const pagination = getPagination(req.query);
    const filters = getFilters(req.query, ["status", "role"]);
    const search = getSearch(req.query);
    const sorting = getSorting(req.query);

    const filteredUsers = users
      .filter((user) =>
        filters.status ? user.status === filters.status : true,
      )
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

    return res
      .status(statusCode.OK)
      .json(response(paginate(filteredUsers, pagination)));
  }),
);

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

res.json(response(result));
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
[my-api] | 2026-04-27 16:00:00 | INFO GET /api/users 200 6ms | file=users.controller.ts | method=findAllUsers | by=anonymous
```

Logger behavior:

- Uses Cambodia local time in `YYYY-MM-DD HH:mm:ss` format
- Infers route file and handler method from Express route metadata
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

## Responses

```js
import {
  errorResponse,
  paginatedResponse,
  response,
  successResponse,
  validationErrorResponse,
} from "api-core-backend";

res.json(response({ id: 1, name: "Sokha" }));

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
