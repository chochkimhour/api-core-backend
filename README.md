# api-core-backend

[![npm package](https://img.shields.io/badge/npm-api--core--backend-cb3837)](https://www.npmjs.com/package/api-core-backend)
![license](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![typescript](https://img.shields.io/badge/types-included-blue)

Clean, lightweight backend utilities for building consistent REST APIs in Node.js and TypeScript.

Use `api-core-backend` for API response helpers, pagination, array pagination, filtering, sorting, search, HTTP status constants, custom errors, and optional Express middleware. The main helpers are plain JavaScript/TypeScript functions, so they work with Express, NestJS, Fastify, Koa, Hono, serverless functions, or plain Node.js.

Created and maintained by **Choch Kimhour** from **Cambodia** &#x1F1F0;&#x1F1ED;.

## Best For

- REST API response formatting
- Express API response helpers
- Node.js backend utilities
- TypeScript backend utilities
- Pagination with `max` and `offset`
- Filtering, sorting, and search query helpers
- HTTP status code constants
- Async Express error handling
- Request logging middleware
- Clean API errors and validation errors
- Optional Swagger/OpenAPI documentation

## Installation

```bash
npm install api-core-backend
```

## Quick Start

### Shortest Response

```js
import { response } from "api-core-backend";

const users = [{ id: 1, name: "Sokha", status: "ACTIVE" }];

res.json(response(users));
```

Output:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": [{ "id": 1, "name": "Sokha", "status": "ACTIVE" }],
  "total": 1,
  "timestamp": "..."
}
```

### Full Response

```js
import { response, statusCode } from "api-core-backend";

res.json(response(users, statusCode.OK, "Users fetched successfully"));
```

Output:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": [{ "id": 1, "name": "Sokha", "status": "ACTIVE" }],
  "total": 1,
  "timestamp": "..."
}
```

### Response With Total From Object

If your result already contains `data` and `total`, `response()` uses it automatically.

```js
const users = {
  data: [{ id: 1, name: "Sokha", status: "ACTIVE" }],
  total: 100,
};

res.json(response(users));
```

Output:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": [{ "id": 1, "name": "Sokha", "status": "ACTIVE" }],
  "total": 100,
  "timestamp": "..."
}
```

### Pagination For Requests

`response()` does not show pagination in JSON. Use `getPagination(req.query)` to read pagination from API query params. Use `paginate(items, pagination)` when you want the package to slice an array and calculate `total` for you.

When the request does not include pagination params, defaults are:

```json
{
  "max": 10,
  "offset": 0
}
```

Example request:

```js
const pagination = getPagination(req.query);

const users = paginate(allUsers, pagination);

res.json(response(users, statusCode.OK, "Users fetched successfully"));
```

Expected `users` shape:

```js
{
  data: [{ id: 1, name: "Sokha", status: "ACTIVE" }],
  total: 20,
}
```

## Express Example

```js
import express from "express";
import {
  asyncHandler,
  getFilters,
  getPagination,
  getSearch,
  logger,
  paginate,
  response,
  statusCode,
} from "api-core-backend";

const app = express();

app.use(logger());

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    const pagination = getPagination(req.query);
    const filters = getFilters(req.query, ["status"]);
    const search = getSearch(req.query);

    const allUsers = [
      { id: 1, name: "Sokha", status: "ACTIVE" },
      { id: 2, name: "Dara", status: "ACTIVE" },
      { id: 3, name: "Sophea", status: "INACTIVE" },
      { id: 4, name: "Vicheka", status: "ACTIVE" },
      { id: 5, name: "Rithy", status: "INACTIVE" },
      { id: 6, name: "Malis", status: "ACTIVE" },
    ];

    // Use filters and search before pagination.
    const filteredUsers = allUsers
      .filter((user) =>
        filters.status ? user.status === filters.status : true,
      )
      .filter((user) =>
        search.keyword
          ? user.name.toLowerCase().includes(search.keyword.toLowerCase())
          : true,
      );

    const users = paginate(filteredUsers, pagination);

    res.json(response(users, statusCode.OK, "Users fetched successfully"));
  }),
);

app.listen(3000);
```

Try it:

```text
http://localhost:3000/users?status=ACTIVE
http://localhost:3000/users?q=sok
http://localhost:3000/users?status=ACTIVE&q=a&max=2&offset=0
```

## Response Helper

`response()` is the easiest helper to remember.

| Syntax                                           | Result                                                      |
| ------------------------------------------------ | ----------------------------------------------------------- |
| `response(data)`                                 | Success response with `statusCode.OK` and automatic `total` |
| `response({ data, total })`                      | Success response with a real database total                 |
| `response(data, statusCode.OK, message)`         | Success response with custom status code and message        |
| `response(data, statusCode.OK, message, total)`  | Success response with status code, message, and real total  |
| `response({ statusCode, message, data, total })` | Object style for full control                               |

When `data` is an array, `total` is automatically `data.length`.

When input is an object like `{ data: [...], total: 100 }`, the final response unwraps it into clean `data` and top-level `total`.

Pagination is handled by `getPagination(req.query)`, not shown in `response()` output. Default request pagination is:

```json
{
  "max": 10,
  "offset": 0
}
```

Try it with:

```text
http://localhost:3000/users?max=5&offset=2
```

`limit` also works as an old alias for `max`:

```text
http://localhost:3000/users?limit=5&offset=2
```

## Status Codes

```js
import { statusCode } from "api-core-backend";

statusCode.OK; // 200
statusCode.CREATED; // 201
statusCode.NO_CONTENT; // 204
statusCode.BAD_REQUEST; // 400
statusCode.UNAUTHORIZED; // 401
statusCode.FORBIDDEN; // 403
statusCode.NOT_FOUND; // 404
statusCode.CONFLICT; // 409
statusCode.UNPROCESSABLE_ENTITY; // 422
statusCode.INTERNAL_SERVER_ERROR; // 500
statusCode.SERVER_ERROR; // 500
```

`HTTP_STATUS` is also exported if you prefer uppercase naming.

## Query Helpers

### Pagination

Use `getPagination()` to normalize query values before using them in a database query.

```js
import { getPagination } from "api-core-backend";

const pagination = getPagination({
  max: "20",
  offset: "40",
  sortBy: "createdAt",
  sortOrder: "desc",
});
```

Output:

```json
{
  "max": 20,
  "offset": 40,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

Rules:

- default `max` is `10`
- default `offset` is `0`
- maximum `max` is `100`
- invalid `max` and `offset` values fall back to defaults
- `sortOrder` only allows `asc` or `desc`
- `limit` still works as a compatibility alias for `max`

### Paginate Array Data

Use `paginate()` when your data is already in an array. It slices the array and calculates `total` automatically.

```js
import { getPagination, paginate } from "api-core-backend";

const pagination = getPagination({ max: "5", offset: "2" });

const users = paginate(allUsers, pagination);
```

Output:

```json
{
  "data": [
    { "id": 3, "name": "Sophea", "status": "INACTIVE" },
    { "id": 4, "name": "Vicheka", "status": "ACTIVE" },
    { "id": 5, "name": "Rithy", "status": "INACTIVE" },
    { "id": 6, "name": "Malis", "status": "ACTIVE" },
    { "id": 7, "name": "Bopha", "status": "ACTIVE" }
  ],
  "total": 20
}
```

### Pagination Metadata

```js
import { getPaginationMeta } from "api-core-backend";

const meta = getPaginationMeta({
  page: 2,
  max: 20,
  total: 100,
});
```

Output:

```json
{
  "page": 2,
  "max": 20,
  "total": 100,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": true
}
```

### Sorting

```js
import { getSorting } from "api-core-backend";

const sorting = getSorting({
  sortBy: "name",
  sortOrder: "asc",
});
```

Output:

```json
{
  "sortBy": "name",
  "sortOrder": "asc"
}
```

### Filtering

Use `getFilters()` to keep only allowed filter fields.

```js
import { getFilters } from "api-core-backend";

const filters = getFilters(
  { status: "ACTIVE", role: "ADMIN", password: "123" },
  ["status", "role"],
);
```

Output:

```json
{
  "status": "ACTIVE",
  "role": "ADMIN"
}
```

### Search

```js
import { getSearch } from "api-core-backend";

getSearch({ q: "student" });
getSearch({ search: "student" });
```

Output:

```json
{
  "keyword": "student"
}
```

## Other Response Helpers

### successResponse

```js
import { successResponse } from "api-core-backend";

successResponse({
  message: "Request successful",
  data: { id: 1, name: "User" },
});
```

Output:

```json
{
  "success": true,
  "message": "Request successful",
  "data": { "id": 1, "name": "User" },
  "timestamp": "..."
}
```

### errorResponse

```js
import { errorResponse } from "api-core-backend";

errorResponse({
  message: "Something went wrong",
  code: "INTERNAL_SERVER_ERROR",
});
```

Output:

```json
{
  "success": false,
  "message": "Something went wrong",
  "error": "INTERNAL_SERVER_ERROR",
  "timestamp": "..."
}
```

### validationErrorResponse

```js
import { validationErrorResponse } from "api-core-backend";

validationErrorResponse({
  errors: [{ field: "email", message: "Email is required" }],
});
```

Output:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Email is required" }],
  "timestamp": "..."
}
```

### paginatedResponse

`paginatedResponse()` is still available for users who prefer explicit `page`, `max`, and `total` input. The response stays clean and only shows top-level `total`.

```js
import { paginatedResponse } from "api-core-backend";

paginatedResponse({
  message: "Data fetched successfully",
  data: [],
  page: 1,
  max: 10,
  total: 100,
});
```

Output:

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [],
  "total": 100,
  "timestamp": "..."
}
```

## Express Middleware

Express support is optional. Express is not installed as a dependency of this package.

```js
import express from "express";
import {
  asyncHandler,
  errorMiddleware,
  logger,
  notFoundMiddleware,
  response,
} from "api-core-backend";

const app = express();

app.use(logger());

app.get(
  "/users",
  asyncHandler(async (_req, res) => {
    res.json(response([{ id: 1, name: "Sokha" }]));
  }),
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

Example log:

```text
[api-core-backend] 2026-04-27T09:00:00.000Z INFO GET /users?max=10 200 4ms from=127.0.0.1
```

Error logs are easier to spot:

```text
[api-core-backend] 2026-04-27T09:01:00.000Z WARN GET /missing 404 3ms from=127.0.0.1
[api-core-backend] 2026-04-27T09:02:00.000Z ERROR POST /users 500 8ms from=127.0.0.1
```

Request source is shown by default. You can also include user-agent:

```js
app.use(
  logger({
    includeUserAgent: true,
  }),
);
```

If you already use `requestLogger()`, it still works. New examples use `logger()` because it is shorter and easier to remember.

## Swagger / OpenAPI

Swagger support is optional. Install these packages only when you want Swagger UI docs:

```bash
npm install swagger-ui-express swagger-jsdoc
```

Import Swagger helpers from the separate subpath:

```js
import {
  createSwaggerSpec,
  setupSwaggerDocs,
  swaggerRoute,
  swaggerSchemas,
  swaggerQueryParameters,
} from "api-core-backend/swagger";
```

### Create OpenAPI Spec

```js
import { createSwaggerSpec } from "api-core-backend/swagger";

const swaggerSpec = createSwaggerSpec({
  title: "My API",
  version: "1.0.0",
  description: "REST API documentation",
  servers: [{ url: "http://localhost:3000", description: "Local server" }],
  tags: [{ name: "Users", description: "User endpoints" }],
  routes: [
    {
      path: "/users",
      tag: "Users",
      summary: "Get users",
      description: "Get users with pagination, filter, and search",
      parameters: [
        { $ref: "#/components/parameters/Max" },
        { $ref: "#/components/parameters/Offset" },
        { $ref: "#/components/parameters/Q" },
        { $ref: "#/components/parameters/Search" },
      ],
      responseSchemaRef: "#/components/schemas/PaginatedResponse",
    },
  ],
});
```

The generated spec includes reusable schemas for:

- `SuccessResponse`
- `ErrorResponse`
- `ValidationErrorResponse`
- `PaginatedResponse`
- `PaginationMeta`

It also includes reusable query parameters for:

- `page`
- `limit`
- `max`
- `offset`
- `sortBy`
- `sortOrder`
- `q`
- `search`

### Express Swagger UI

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
  routes: [
    {
      path: "/users",
      tag: "Users",
      summary: "Get users",
      responseSchemaRef: "#/components/schemas/PaginatedResponse",
    },
  ],
});
```

Open:

```text
http://localhost:3000/api-docs
```

`setupSwaggerDocs()` loads `swagger-ui-express` only when you call it. Users who do not need Swagger do not need to install Swagger packages.

For a very small endpoint, this is enough:

```js
routes: [
  {
    path: "/users",
    tag: "Users",
    summary: "Get users",
  },
];
```

## Error Classes

```js
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  statusCode,
} from "api-core-backend";

throw new NotFoundError("User not found");

throw new ValidationError("Validation failed", [
  { field: "email", message: "Email is required" },
]);

throw new AppError({
  message: "Something went wrong",
  statusCode: statusCode.INTERNAL_SERVER_ERROR,
  code: "INTERNAL_SERVER_ERROR",
});
```

## Import Styles

### ES Modules

Add `"type": "module"` to your project `package.json` when using `import` in `.js` files.

```json
{
  "type": "module"
}
```

```js
import { response } from "api-core-backend";
```

### CommonJS

```js
const { response } = require("api-core-backend");
```

## Requirements

- Node.js `>=18`
- TypeScript is supported, but not required
- No runtime dependencies

## API Reference

### Response Helpers

| Function                                                    | Purpose                                 |
| ----------------------------------------------------------- | --------------------------------------- |
| `response(input?, statusOrTotal?, messageOrTotal?, total?)` | Easiest success response helper         |
| `successResponse(input?)`                                   | Standard success response               |
| `errorResponse(input?)`                                     | Standard error response                 |
| `validationErrorResponse(input?)`                           | Validation error response               |
| `paginatedResponse(input)`                                  | Success response with top-level `total` |

### Query Helpers

| Function                                     | Purpose                                        |
| -------------------------------------------- | ---------------------------------------------- |
| `getPagination(query?, options?)`            | Normalizes max, offset, sortBy, and sortOrder  |
| `paginate(items, pagination)`                | Slices array data and calculates total         |
| `normalizePaginationQuery(query?, options?)` | Lower-level pagination normalizer              |
| `getPaginationMeta({ page, max, total })`    | Builds full pagination metadata                |
| `getSorting(query?)`                         | Normalizes sorting input                       |
| `getFilters(query, allowedFields)`           | Returns only allowed filter fields             |
| `getSearch(query?)`                          | Extracts a search keyword from `q` or `search` |

### Middleware

| Function                                 | Purpose                                                           |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `asyncHandler(handler)`                  | Wraps async Express route handlers and forwards errors to `next`  |
| `errorMiddleware(error, req, res, next)` | Sends standard JSON error responses                               |
| `notFoundMiddleware(req, res, next)`     | Creates a `NotFoundError` for unmatched routes                    |
| `logger(options?)`                       | Logs time, method, URL, status code, duration, and request source |
| `requestLogger(options?)`                | Backward-compatible alias for `logger(options?)`                  |

### Swagger Helpers

Import from `api-core-backend/swagger`.

| Function / Export                | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| `createSwaggerSpec(options)`     | Creates a framework-independent OpenAPI spec |
| `setupSwaggerDocs(app, options)` | Mounts Swagger UI in Express apps            |
| `swaggerRoute(options)`          | Creates one OpenAPI route with simple syntax |
| `swaggerRoutes(routes)`          | Creates many OpenAPI routes                  |
| `swaggerSchemas`                 | Reusable response and pagination schemas     |
| `swaggerQueryParameters`         | Reusable query parameters                    |

### Types

```ts
import type {
  ApiError,
  ApiResponse,
  FilterQuery,
  PaginatedResponse,
  PaginationMeta,
  PaginationQuery,
  SearchQuery,
  SortOrder,
  SortQuery,
  ValidationErrorItem,
} from "api-core-backend";
```

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
