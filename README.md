# core-backend

[![npm version](https://img.shields.io/npm/v/core-backend?label=npm)](https://www.npmjs.com/package/core-backend)
[![license](https://img.shields.io/npm/l/core-backend?label=license)](LICENSE)
[![downloads](https://img.shields.io/npm/dm/core-backend?label=downloads)](https://www.npmjs.com/package/core-backend)
![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)

Clean, lightweight backend utilities for building consistent REST APIs in Node.js.

`core-backend` helps you standardize common backend patterns such as JSON responses, pagination, sorting, filtering, searching, HTTP status codes, custom errors, and optional Express middleware. The core utilities are plain TypeScript functions, so they can be used with Express, NestJS, Fastify, Koa, Hono, AdonisJS, or plain Node.js.

Created and maintained by **Choch Kimhour** from Cambodia 🇰🇭.

## Why Use This Package?

Most backend APIs repeat the same small patterns again and again:

- response objects with `success`, `message`, `data`, and `timestamp`
- pagination values from `page` and `limit`
- safe sorting from `sortBy` and `sortOrder`
- filtering only allowed query fields
- search keywords from `q` or `search`
- custom HTTP errors
- async error handling in Express

`core-backend` keeps those patterns clean, reusable, and framework-independent.

## Features

- Standard success, error, validation error, and paginated responses
- Pagination helpers with default page, default limit, max limit, and offset calculation
- Sorting helper with safe `asc` and `desc` support
- Filtering helper that only allows developer-approved fields
- Search helper that supports `q` and `search`
- HTTP status constants for common REST API responses
- Custom error classes for common API errors
- Optional Express-compatible middleware
- TypeScript types and declaration files included
- Works with both `import` and `require`
- No runtime dependencies

## Installation

```bash
npm install core-backend
```

## Requirements

- Node.js `>=18`
- TypeScript is supported, but not required

## JavaScript and TypeScript Support

`core-backend` works with both JavaScript and TypeScript projects.

- JavaScript projects can use it with `require()`
- TypeScript projects can use it with `import`
- Type definitions are included automatically
- No extra type package is required

```js
const { successResponse } = require("core-backend");
```

```ts
import { successResponse, type ApiResponse } from "core-backend";
```

## Supported Frameworks and Runtimes

`core-backend` can be used with almost any JavaScript or TypeScript backend because the main utilities are plain functions that return plain objects.

Commonly supported runtimes and frameworks:

- Node.js
- Express.js
- NestJS
- Fastify
- Koa
- Hono
- AdonisJS
- Restify
- Sails.js
- LoopBack
- FeathersJS
- Next.js API Routes
- Next.js Route Handlers
- Nuxt/Nitro server routes
- Remix loaders and actions
- AWS Lambda
- Google Cloud Functions
- Azure Functions
- Vercel Functions
- Netlify Functions
- Bun backend apps
- Deno backend apps with npm package compatibility

Best for:

- REST APIs
- CRUD APIs
- Admin dashboards
- SaaS backends
- E-commerce APIs
- School and student systems
- Mobile app backends
- Microservices
- Serverless APIs

Only the Express middleware helpers are Express-style. The response helpers, pagination helpers, sorting, filtering, search, constants, types, and error classes can be used with any backend framework.

## Quick Start

```ts
import { getPagination, successResponse } from "core-backend";

const pagination = getPagination({
  page: "2",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "desc"
});

const response = successResponse({
  message: "Users fetched successfully",
  data: [{ id: 1, name: "Ada Lovelace" }]
});

console.log(pagination);
console.log(response);
```

## Import Styles

### TypeScript or ESM

```ts
import { successResponse, getPagination } from "core-backend";
```

### CommonJS

```js
const { successResponse, getPagination } = require("core-backend");
```

## Standard Responses

### Success Response

```ts
import { successResponse } from "core-backend";

const response = successResponse({
  message: "Request successful",
  data: { id: 1, name: "User" }
});
```

Output:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "id": 1,
    "name": "User"
  },
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

### Error Response

```ts
import { errorResponse } from "core-backend";

const response = errorResponse({
  message: "Something went wrong",
  code: "INTERNAL_SERVER_ERROR",
  details: null
});
```

Output:

```json
{
  "success": false,
  "message": "Something went wrong",
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "details": null
  },
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

### Validation Error Response

```ts
import { validationErrorResponse } from "core-backend";

const response = validationErrorResponse({
  errors: [{ field: "email", message: "Email is required" }]
});
```

Output:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

### Paginated Response

```ts
import { paginatedResponse } from "core-backend";

const response = paginatedResponse({
  message: "Data fetched successfully",
  data: [],
  page: 1,
  limit: 10,
  total: 100
});
```

Output:

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

## Pagination

Use `getPagination()` to safely normalize query values before passing them to a service, repository, ORM, or database query.

```ts
import { getPagination } from "core-backend";

const pagination = getPagination({
  page: "2",
  limit: "20",
  sortBy: "createdAt",
  sortOrder: "desc"
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

```ts
import { getPaginationMeta } from "core-backend";

const meta = getPaginationMeta({
  page: 2,
  limit: 20,
  total: 100
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

## Sorting

```ts
import { getSorting } from "core-backend";

const sorting = getSorting({
  sortBy: "name",
  sortOrder: "asc"
});
```

Output:

```json
{
  "sortBy": "name",
  "sortOrder": "asc"
}
```

## Filtering

Use `getFilters()` to prevent users from filtering by fields you do not allow.

```ts
import { getFilters } from "core-backend";

const filters = getFilters(
  { status: "ACTIVE", role: "ADMIN", password: "123" },
  ["status", "role"]
);
```

Output:

```json
{
  "status": "ACTIVE",
  "role": "ADMIN"
}
```

The `password` field is ignored because it is not in the allowed field list.

## Search

```ts
import { getSearch } from "core-backend";

const search = getSearch({ q: "student" });
```

Output:

```json
{
  "keyword": "student"
}
```

`getSearch()` supports both query styles:

```ts
getSearch({ q: "student" });
getSearch({ search: "student" });
```

## HTTP Status Constants

```ts
import { HTTP_STATUS } from "core-backend";

HTTP_STATUS.OK; // 200
HTTP_STATUS.CREATED; // 201
HTTP_STATUS.BAD_REQUEST; // 400
HTTP_STATUS.UNAUTHORIZED; // 401
HTTP_STATUS.FORBIDDEN; // 403
HTTP_STATUS.NOT_FOUND; // 404
HTTP_STATUS.CONFLICT; // 409
HTTP_STATUS.UNPROCESSABLE_ENTITY; // 422
HTTP_STATUS.INTERNAL_SERVER_ERROR; // 500
```

## Error Classes

```ts
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from "core-backend";

throw new NotFoundError("User not found");

throw new ValidationError("Validation failed", [
  { field: "email", message: "Email is required" }
]);

throw new AppError({
  message: "Something went wrong",
  statusCode: 500,
  code: "INTERNAL_SERVER_ERROR",
  details: null
});
```

Each error supports:

- `message`
- `statusCode`
- `code`
- `details`
- `isOperational`

## Express Usage

Express support is optional. Express is not installed as a dependency of this package.

```ts
import express from "express";
import {
  asyncHandler,
  errorMiddleware,
  notFoundMiddleware,
  successResponse
} from "core-backend";

const app = express();

app.use(express.json());

app.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = [{ id: 1, name: "Ada Lovelace" }];

    res.json(
      successResponse({
        message: "Users fetched successfully",
        data: users
      })
    );
  })
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(3000);
```

## Use With Any Framework

The main utilities return plain JavaScript objects. That means you can use them with almost any backend framework.

### Plain Node.js

```ts
import http from "node:http";
import { successResponse } from "core-backend";

const server = http.createServer((_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(successResponse({ data: { ok: true } })));
});

server.listen(3000);
```

### Fastify

```ts
import Fastify from "fastify";
import { successResponse } from "core-backend";

const app = Fastify();

app.get("/health", async () => {
  return successResponse({
    message: "Service is healthy",
    data: { status: "ok" }
  });
});
```

### NestJS

```ts
import { Controller, Get } from "@nestjs/common";
import { successResponse } from "core-backend";

@Controller("users")
export class UsersController {
  @Get()
  findAll() {
    return successResponse({
      message: "Users fetched successfully",
      data: []
    });
  }
}
```

### Koa

```ts
import Koa from "koa";
import { successResponse } from "core-backend";

const app = new Koa();

app.use((ctx) => {
  ctx.body = successResponse({
    message: "Koa response",
    data: { ok: true }
  });
});
```

## JavaScript Example

```js
const { getPagination, successResponse } = require("core-backend");

const pagination = getPagination({
  page: "2",
  limit: "20"
});

const response = successResponse({
  message: "Loaded from JavaScript",
  data: pagination
});

console.log(response);
```

## TypeScript Example

```ts
import {
  getFilters,
  getPagination,
  getSearch,
  successResponse,
  type ApiResponse,
  type PaginationQuery
} from "core-backend";

const query: PaginationQuery = {
  page: "1",
  limit: "10",
  sortBy: "createdAt",
  sortOrder: "desc"
};

const response: ApiResponse = successResponse({
  message: "TypeScript response",
  data: {
    pagination: getPagination(query),
    filters: getFilters({ status: "ACTIVE", password: "secret" }, ["status"]),
    search: getSearch({ q: "student" })
  }
});
```

## API Reference

### Response Helpers

| Function | Purpose |
| --- | --- |
| `successResponse(input?)` | Creates a standard successful API response. |
| `errorResponse(input?)` | Creates a standard error API response. |
| `validationErrorResponse(input?)` | Creates a standard validation error response. |
| `paginatedResponse(input)` | Creates a successful response with pagination metadata. |

### Query Helpers

| Function | Purpose |
| --- | --- |
| `getPagination(query?, options?)` | Normalizes page, limit, offset, sortBy, and sortOrder. |
| `normalizePaginationQuery(query?, options?)` | Lower-level pagination normalizer. |
| `getPaginationMeta({ page, limit, total })` | Creates pagination metadata for API responses. |
| `getSorting(query?)` | Normalizes sorting input. |
| `getFilters(query, allowedFields)` | Returns only allowed filter fields. |
| `getSearch(query?)` | Extracts a search keyword from `q` or `search`. |

### Middleware

| Function | Purpose |
| --- | --- |
| `asyncHandler(handler)` | Wraps async Express route handlers and forwards errors to `next`. |
| `errorMiddleware(error, req, res, next)` | Sends standard JSON error responses. |
| `notFoundMiddleware(req, res, next)` | Creates a `NotFoundError` for unmatched routes. |

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
  ValidationErrorItem
} from "core-backend";
```

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
