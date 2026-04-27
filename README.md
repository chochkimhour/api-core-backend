# api-core-backend

[![npm package](https://img.shields.io/badge/npm-api--core--backend-cb3837)](https://www.npmjs.com/package/api-core-backend)
![license](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![typescript](https://img.shields.io/badge/types-included-blue)

Clean, lightweight backend utilities for building REST APIs in Node.js and TypeScript.

Use it for clean API responses, pagination, filtering, search, status codes, async error handling, request logging, and optional Swagger/OpenAPI docs.

Created and maintained by **Choch Kimhour** from **Cambodia** &#x1F1F0;&#x1F1ED;.

## Features

- Clean `response()` helper with automatic `success`, `statusCode`, `message`, `total`, and `timestamp`
- Pagination with `max` and `offset`
- Array pagination with automatic total calculation
- Filter, search, and sorting query helpers
- HTTP status code constants
- Express async handler and error middleware
- Simple request logger
- Optional Swagger/OpenAPI helpers
- TypeScript types included
- No runtime dependencies

## Installation

```bash
npm install api-core-backend
```

## Quick Start

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

With custom status and message:

```js
import { response, statusCode } from "api-core-backend";

res.json(response(users, statusCode.OK, "Users fetched successfully"));
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
  "/api/users",
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
    ];

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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

Try:

```text
http://localhost:3000/api/users
http://localhost:3000/api/users?max=2&offset=0
http://localhost:3000/api/users?status=ACTIVE
http://localhost:3000/api/users?q=sokha
```

## Response Helper

`response()` is the main helper.

```js
response(data);
response(data, statusCode.OK, "Users fetched successfully");
response({ data, total });
```

If `data` is an array, `total` is calculated from `data.length`.

If input is `{ data, total }`, the final response stays clean:

```js
const users = {
  data: [{ id: 1, name: "Sokha" }],
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
  "data": [{ "id": 1, "name": "Sokha" }],
  "total": 100,
  "timestamp": "..."
}
```

## Pagination

`response()` does not show pagination in JSON. Use `getPagination()` to read query params, then use `paginate()` to slice array data.

```js
import { getPagination, paginate, response } from "api-core-backend";

const pagination = getPagination(req.query);
const users = paginate(allUsers, pagination);

res.json(response(users));
```

Default pagination:

```json
{
  "max": 10,
  "offset": 0
}
```

Supported query params:

```text
?max=10&offset=0
?limit=10&offset=0
?sortBy=name&sortOrder=asc
```

`limit` works as an alias for `max`.

## Search And Filter

```js
import { getFilters, getSearch } from "api-core-backend";

const filters = getFilters(req.query, ["status", "role"]);
const search = getSearch(req.query);
```

Example:

```text
/api/users?status=ACTIVE&q=sokha
```

## Logger

```js
import { logger } from "api-core-backend";

app.use(logger());
```

Terminal output:

```text
[api-core-backend] 2026-04-27T09:00:00.000Z INFO GET /api/users 200 6ms from=127.0.0.1
```

Error logs:

```text
[api-core-backend] 2026-04-27T09:01:00.000Z WARN GET /missing 404 3ms from=127.0.0.1
[api-core-backend] 2026-04-27T09:02:00.000Z ERROR POST /api/users 500 8ms from=127.0.0.1
```

Include user-agent:

```js
app.use(logger({ includeUserAgent: true }));
```

`requestLogger()` is still available as an alias for `logger()`.

## Status Codes

```js
import { statusCode } from "api-core-backend";

statusCode.OK; // 200
statusCode.CREATED; // 201
statusCode.BAD_REQUEST; // 400
statusCode.UNAUTHORIZED; // 401
statusCode.FORBIDDEN; // 403
statusCode.NOT_FOUND; // 404
statusCode.CONFLICT; // 409
statusCode.UNPROCESSABLE_ENTITY; // 422
statusCode.INTERNAL_SERVER_ERROR; // 500
```

## Error Handling

```js
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
  asyncHandler,
  errorMiddleware,
  notFoundMiddleware,
} from "api-core-backend";

app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    throw new NotFoundError("User not found");
  }),
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

Validation error:

```js
throw new ValidationError("Validation failed", [
  { field: "email", message: "Email is required" },
]);
```

## Swagger

Swagger is optional. Install these packages only when you need API docs:

```bash
npm install swagger-ui-express swagger-jsdoc
```

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
      path: "/api/users",
      method: "get",
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

You can also build an OpenAPI spec without Express:

```js
import { createSwaggerSpec } from "api-core-backend/swagger";

const spec = createSwaggerSpec({
  title: "My API",
  version: "1.0.0",
  servers: [{ url: "http://localhost:3000" }],
});
```

## Import Styles

ES Modules:

```js
import { response } from "api-core-backend";
```

CommonJS:

```js
const { response } = require("api-core-backend");
```

When using `import` in `.js` files, add this to your app `package.json`:

```json
{
  "type": "module"
}
```

## API Reference

### Main Helpers

| Helper                      | Purpose                         |
| --------------------------- | ------------------------------- |
| `response()`                | Clean success response          |
| `successResponse()`         | Standard success response       |
| `errorResponse()`           | Standard error response         |
| `validationErrorResponse()` | Validation error response       |
| `paginatedResponse()`       | Response with top-level `total` |
| `statusCode`                | HTTP status code constants      |

### Query Helpers

| Helper            | Purpose                            |
| ----------------- | ---------------------------------- |
| `getPagination()` | Reads `max`, `limit`, and `offset` |
| `paginate()`      | Slices arrays and calculates total |
| `getFilters()`    | Keeps only allowed filter fields   |
| `getSearch()`     | Reads `q` or `search`              |
| `getSorting()`    | Reads `sortBy` and `sortOrder`     |

### Express Helpers

| Helper               | Purpose                               |
| -------------------- | ------------------------------------- |
| `asyncHandler()`     | Wraps async route handlers            |
| `errorMiddleware`    | Sends standard JSON errors            |
| `notFoundMiddleware` | Handles unmatched routes              |
| `logger()`           | Logs request time, status, and source |
| `requestLogger()`    | Alias for `logger()`                  |

### Swagger Helpers

Import from `api-core-backend/swagger`.

| Helper                   | Purpose                           |
| ------------------------ | --------------------------------- |
| `createSwaggerSpec()`    | Creates an OpenAPI spec           |
| `setupSwaggerDocs()`     | Mounts Swagger UI in Express      |
| `swaggerRoute()`         | Creates one route definition      |
| `swaggerRoutes()`        | Creates many route definitions    |
| `swaggerSchemas`         | Reusable OpenAPI schemas          |
| `swaggerQueryParameters` | Reusable OpenAPI query parameters |

## Requirements

- Node.js `>=18`
- TypeScript supported
- No runtime dependencies

## Links

- npm: [api-core-backend](https://www.npmjs.com/package/api-core-backend)
- Repository: [gitlab.com/chochkimhour/api-core-backend](https://gitlab.com/chochkimhour/api-core-backend)

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
