# api-core-backend

[![npm package](https://img.shields.io/badge/npm-api--core--backend-cb3837)](https://www.npmjs.com/package/api-core-backend)
![license](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![typescript](https://img.shields.io/badge/types-included-blue)

Clean, lightweight backend utilities for building consistent REST APIs in Node.js.

Use `api-core-backend` for simple JSON responses, pagination, sorting, filtering, search, HTTP status constants, custom errors, and optional Express middleware. The main helpers are plain JavaScript/TypeScript functions, so they work with Express, NestJS, Fastify, Koa, Hono, serverless functions, or plain Node.js.

Created and maintained by **Choch Kimhour** from **Cambodia** 🇰🇭.

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

If your result already contains `data` and `total`, `totalUser`, or `totalUsers`, `response()` uses it automatically.

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
  "message": "Request successful",
  "data": [{ "id": 1, "name": "Sokha", "status": "ACTIVE" }],
  "total": 100,
  "timestamp": "..."
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
  response,
  statusCode,
} from "api-core-backend";

const app = express();

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    const pagination = getPagination(req.query);
    const filters = getFilters(req.query, ["status", "role"]);
    const search = getSearch(req.query);

    // Use pagination, filters, and search in your database query.
    const users = {
      data: [{ id: 1, name: "Sokha", status: "ACTIVE" }],
      total: 100,
    };

    res.json(response(users, statusCode.OK, "Users fetched successfully"));
  }),
);

app.listen(3000);
```

## Response Helper

`response()` is the easiest helper to remember.

| Syntax | Result |
| ------ | ------ |
| `response(data)` | Success response with automatic `total` when `data` is an array |
| `response(data, total)` | Success response with a real database total |
| `response(data, statusCode.OK, message)` | Success response with status code and message |
| `response(data, statusCode.OK, message, total)` | Success response with status code, message, and real total |
| `response({ statusCode, message, data, total })` | Object style for full control |

When `data` is an array, `total` is automatically `data.length`.

When input is an object like `{ data: [...], total: 100 }`, the final response unwraps it into clean `data` and top-level `total`.

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
  page: "2",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "desc",
});
```

Output:

```json
{
  "page": 2,
  "limit": 20,
  "offset": 20,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

Rules:

- default `page` is `1`
- default `limit` is `10`
- maximum `limit` is `100`
- invalid `page` and `limit` values fall back to defaults
- `sortOrder` only allows `asc` or `desc`
- `offset` is calculated from `page` and `limit`

### Pagination Metadata

```js
import { getPaginationMeta } from "api-core-backend";

const meta = getPaginationMeta({
  page: 2,
  limit: 20,
  total: 100,
});
```

Output:

```json
{
  "page": 2,
  "limit": 20,
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

`paginatedResponse()` is still available for users who prefer explicit `page`, `limit`, and `total` input. The response stays clean and only shows top-level `total`.

```js
import { paginatedResponse } from "api-core-backend";

paginatedResponse({
  message: "Data fetched successfully",
  data: [],
  page: 1,
  limit: 10,
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
  notFoundMiddleware,
  response,
} from "api-core-backend";

const app = express();

app.get(
  "/users",
  asyncHandler(async (_req, res) => {
    res.json(response([{ id: 1, name: "Sokha" }]));
  }),
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
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

| Function | Purpose |
| -------- | ------- |
| `response(input?, statusOrTotal?, messageOrTotal?, total?)` | Easiest success response helper |
| `successResponse(input?)` | Standard success response |
| `errorResponse(input?)` | Standard error response |
| `validationErrorResponse(input?)` | Validation error response |
| `paginatedResponse(input)` | Success response with top-level `total` |

### Query Helpers

| Function | Purpose |
| -------- | ------- |
| `getPagination(query?, options?)` | Normalizes page, limit, offset, sortBy, and sortOrder |
| `normalizePaginationQuery(query?, options?)` | Lower-level pagination normalizer |
| `getPaginationMeta({ page, limit, total })` | Builds full pagination metadata |
| `getSorting(query?)` | Normalizes sorting input |
| `getFilters(query, allowedFields)` | Returns only allowed filter fields |
| `getSearch(query?)` | Extracts a search keyword from `q` or `search` |

### Middleware

| Function | Purpose |
| -------- | ------- |
| `asyncHandler(handler)` | Wraps async Express route handlers and forwards errors to `next` |
| `errorMiddleware(error, req, res, next)` | Sends standard JSON error responses |
| `notFoundMiddleware(req, res, next)` | Creates a `NotFoundError` for unmatched routes |

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
