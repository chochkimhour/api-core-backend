# api-core-backend

[![npm package](https://img.shields.io/badge/npm-api--core--backend-cb3837)](https://www.npmjs.com/package/api-core-backend)
![license](https://img.shields.io/badge/license-MIT-blue)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)
![typescript](https://img.shields.io/badge/types-included-blue)

Clean, lightweight backend utilities for building REST APIs in Node.js and TypeScript.

Use it for standard JSON responses, pagination, filtering, search, sorting, HTTP status codes, async error handling, request logging, and optional Swagger/OpenAPI docs.

Created and maintained by **Choch Kimhour** from **Cambodia**.

## Features

- `response()` helper for clean success responses
- `successResponse()`, `errorResponse()`, `validationErrorResponse()`, and `paginatedResponse()`
- Pagination helpers for `max`, `limit`, `offset`, and `page`
- Filter, search, and sorting query helpers
- HTTP status code constants
- Express async handler, not found middleware, and error middleware
- Request logger with one-time global config
- Cambodia local request log date and time (`YYYY-MM-DD HH:mm:ss`)
- Automatic Express route context logging
- Optional Swagger/OpenAPI helpers
- TypeScript types included
- No runtime dependencies

## Requirements

- Node.js `>=18`
- Express or an Express-compatible framework for middleware helpers
- TypeScript is supported but not required

## Installation

```bash
npm install api-core-backend
```

For Swagger UI only, install the optional peer dependencies:

```bash
npm install swagger-ui-express swagger-jsdoc
```

## Import Styles

ES modules:

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

## Project Setup From A To Z

This is a complete Express setup using the main package features.

Example project structure:

```text
my-api/
  src/
    app.js
    server.js
    routes/
      users.routes.js
    controllers/
      users.controller.js
```

### 1. Create The App

`src/app.js`

```js
import express from "express";
import {
  configureLogger,
  errorMiddleware,
  logger,
  notFoundMiddleware,
} from "api-core-backend";
import { usersRouter } from "./routes/users.routes.js";

const app = express();

app.use(express.json());

configureLogger({
  projectName: "my-api",
  getUser: (req) => req.user?.username,
});

app.use(logger());

app.use("/api/users", usersRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
```

### 2. Start The Server

`src/server.js`

```js
import { app } from "./app.js";

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

### 3. Create Routes

`src/routes/users.routes.js`

```js
import { Router } from "express";
import { asyncHandler } from "api-core-backend";
import { createUser, findAllUsers, findUserById } from "../controllers/users.controller.js";

const usersRouter = Router();

usersRouter.get("/", asyncHandler(findAllUsers));
usersRouter.get("/:id", asyncHandler(findUserById));
usersRouter.post("/", asyncHandler(createUser));

export { usersRouter };
```

Use named controller functions like `findAllUsers` and `createUser`. The logger uses these names for `method=...`.

### 4. Create Controllers

`src/controllers/users.controller.js`

```js
import {
  BadRequestError,
  NotFoundError,
  getFilters,
  getPagination,
  getSearch,
  getSorting,
  paginate,
  response,
  statusCode,
} from "api-core-backend";

const users = [
  { id: "1", name: "Sokha", status: "ACTIVE", role: "ADMIN" },
  { id: "2", name: "Dara", status: "ACTIVE", role: "USER" },
  { id: "3", name: "Sophea", status: "INACTIVE", role: "USER" },
];

export async function findAllUsers(req, res) {
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

  return res
    .status(statusCode.OK)
    .json(response(result, statusCode.OK, "Users fetched successfully"));
}

export async function findUserById(req, res) {
  const user = users.find((item) => item.id === req.params.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return res.json(response(user));
}

export async function createUser(req, res) {
  if (!req.body?.name) {
    throw new BadRequestError("Name is required");
  }

  const user = {
    id: String(users.length + 1),
    name: req.body.name,
    status: req.body.status ?? "ACTIVE",
    role: req.body.role ?? "USER",
  };

  users.push(user);

  return res
    .status(statusCode.CREATED)
    .json(response(user, statusCode.CREATED, "User created successfully"));
}
```

### 5. Test The API

```text
GET  http://localhost:3000/api/users
GET  http://localhost:3000/api/users?max=2&offset=0
GET  http://localhost:3000/api/users?status=ACTIVE
GET  http://localhost:3000/api/users?role=USER&q=so
GET  http://localhost:3000/api/users?sortBy=name&sortOrder=desc
GET  http://localhost:3000/api/users/1
POST http://localhost:3000/api/users
```

## Logger

Configure the logger once during app bootstrap:

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
[my-api] 2026-04-27 16:00:00 INFO GET /api/users 200 6ms file=users.controller.ts method=findAllUsers by=system
```

The logger:

- uses Phnom Penh, Cambodia date and time as `YYYY-MM-DD HH:mm:ss`
- uses your configured project name
- hides request IP/source by default
- logs `by=system` when no user is available
- reads the matched Express route after response finish
- infers `file=users.controller.ts` from the route path
- infers `method=findAllUsers` from the named route handler

Logger options:

```js
configureLogger({
  projectName: "my-api",
  includeUserAgent: true,
  includeRequestFrom: false,
  includeRouteContext: true,
  controllerFileSuffix: ".controller.ts",
  getUser: (req) => req.user?.username,
});
```

Include request IP/source only when needed:

```js
configureLogger({ includeRequestFrom: true });
```

Override one middleware instance:

```js
app.use(logger({ projectName: "admin-api" }));
```

`requestLogger()` is available as an alias for `logger()`.

## Response Helpers

### Basic Success Response

```js
import { response } from "api-core-backend";

res.json(response({ id: 1, name: "Sokha" }));
```

Output:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": { "id": 1, "name": "Sokha" },
  "timestamp": "..."
}
```

### Custom Status And Message

```js
import { response, statusCode } from "api-core-backend";

res
  .status(statusCode.CREATED)
  .json(response(user, statusCode.CREATED, "User created successfully"));
```

### Array Response

```js
res.json(response(users));
```

If `data` is an array, `total` is calculated automatically:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": [],
  "total": 0,
  "timestamp": "..."
}
```

### Data With Total

```js
res.json(response({ data: users, total: 100 }));
```

### Other Response Helpers

```js
import {
  errorResponse,
  paginatedResponse,
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
  page: 1,
  max: 10,
  total: 100,
});
```

## Pagination

Read pagination from query params:

```js
import { getPagination, paginate, response } from "api-core-backend";

const pagination = getPagination(req.query);
const result = paginate(users, pagination);

res.json(response(result));
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
?page=1
?max=10&offset=0
?limit=10&offset=0
?sortBy=name&sortOrder=asc
```

Customize pagination limits:

```js
const pagination = getPagination(req.query, {
  defaultPage: 1,
  defaultMax: 20,
  maxMax: 100,
});
```

`limit` works as an alias for `max`.

## Filters

Only allow specific fields from the query string:

```js
import { getFilters } from "api-core-backend";

const filters = getFilters(req.query, ["status", "role"]);
```

Example:

```text
/api/users?status=ACTIVE&role=USER
```

Result:

```js
{
  status: "ACTIVE",
  role: "USER",
}
```

Unknown fields are ignored.

## Search

Read search keyword from `q` or `search`:

```js
import { getSearch } from "api-core-backend";

const search = getSearch(req.query);
```

Examples:

```text
/api/users?q=sokha
/api/users?search=sokha
```

Result:

```js
{
  keyword: "sokha",
}
```

## Sorting

Read sorting from `sortBy` and `sortOrder`:

```js
import { getSorting } from "api-core-backend";

const sorting = getSorting(req.query);
```

Example:

```text
/api/users?sortBy=name&sortOrder=desc
```

Result:

```js
{
  sortBy: "name",
  sortOrder: "desc",
}
```

`sortOrder` defaults to `"asc"`.

## Status Codes

```js
import { statusCode, HTTP_STATUS } from "api-core-backend";

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

## Error Handling

Use `asyncHandler()` for async controllers:

```js
import { asyncHandler } from "api-core-backend";

app.get("/api/users/:id", asyncHandler(findUserById));
```

Throw standard HTTP errors:

```js
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "api-core-backend";

throw new NotFoundError("User not found");
throw new BadRequestError("Name is required");
throw new UnauthorizedError("Please login first");
throw new ForbiddenError("Permission denied");
throw new ConflictError("Email already exists");
throw new ValidationError("Validation failed", [
  { field: "email", message: "Email is required" },
]);
```

Register error middleware after routes:

```js
import { errorMiddleware, notFoundMiddleware } from "api-core-backend";

app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

Error output:

```json
{
  "success": false,
  "message": "User not found",
  "error": "NOT_FOUND",
  "details": null,
  "timestamp": "..."
}
```

## Swagger

Swagger support is optional.

Install peer dependencies:

```bash
npm install swagger-ui-express swagger-jsdoc
```

Mount Swagger UI:

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
    {
      path: "/api/users/{id}",
      method: "get",
      tag: "Users",
      summary: "Get user by id",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responseSchemaRef: "#/components/schemas/SuccessResponse",
    },
  ],
});
```

Open:

```text
http://localhost:3000/api-docs
```

Create an OpenAPI spec without mounting Express:

```js
import { createSwaggerSpec } from "api-core-backend/swagger";

const spec = createSwaggerSpec({
  title: "My API",
  version: "1.0.0",
  servers: [{ url: "http://localhost:3000" }],
});
```

## TypeScript Example

```ts
import type { Request, Response } from "express";
import { response, statusCode } from "api-core-backend";

type User = {
  id: string;
  name: string;
};

export async function findUserById(req: Request, res: Response) {
  const user: User = {
    id: req.params.id,
    name: "Sokha",
  };

  return res
    .status(statusCode.OK)
    .json(response<User>(user, statusCode.OK, "User fetched successfully"));
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
| `HTTP_STATUS`               | HTTP status code constants      |

### Query Helpers

| Helper            | Purpose                            |
| ----------------- | ---------------------------------- |
| `getPagination()` | Reads `page`, `max`, `limit`, and `offset` |
| `paginate()`      | Slices arrays and calculates total |
| `getPaginationMeta()` | Builds pagination metadata     |
| `getFilters()`    | Keeps only allowed filter fields   |
| `getSearch()`     | Reads `q` or `search`              |
| `getSorting()`    | Reads `sortBy` and `sortOrder`     |

### Express Helpers

| Helper                  | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `asyncHandler()`        | Wraps async route handlers                   |
| `errorMiddleware`       | Sends standard JSON errors                   |
| `notFoundMiddleware`    | Handles unmatched routes                     |
| `configureLogger()`     | Sets global logger options once              |
| `logger()`              | Logs request time, status, route, and user   |
| `requestLogger()`       | Alias for `logger()`                         |
| `resetLoggerConfig()`   | Clears global logger config                  |

### Logger Options

| Option                 | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `enabled`              | Disable logger when set to `false`           |
| `projectName`          | Name shown inside log prefix                 |
| `includeRequestFrom`   | Include request source or IP                 |
| `includeIp`            | Alias-style option for request source        |
| `includeUserAgent`     | Include user-agent                           |
| `includeRouteContext`  | Include route-based file and method context  |
| `controllerFileSuffix` | Suffix for inferred controller file          |
| `sourceFile`           | Manually set source file                     |
| `sourceMethod`         | Manually set source method                   |
| `getSourceFile`        | Resolve source file from request             |
| `getSourceMethod`      | Resolve source method from request           |
| `getUser`              | Resolve current user from request            |
| `log`                  | Custom log function                          |
| `logger`               | Alias custom log function                    |

### Error Classes

| Class               | Status |
| ------------------- | ------ |
| `BadRequestError`   | 400    |
| `UnauthorizedError` | 401    |
| `ForbiddenError`    | 403    |
| `NotFoundError`     | 404    |
| `ConflictError`     | 409    |
| `ValidationError`   | 422    |

### Swagger Helpers

Import from `api-core-backend/swagger`.

| Helper                   | Purpose                      |
| ------------------------ | ---------------------------- |
| `createSwaggerSpec()`    | Creates an OpenAPI spec      |
| `setupSwaggerDocs()`     | Mounts Swagger UI in Express |
| `swaggerRoute()`         | Creates one route definition |
| `swaggerRoutes()`        | Creates route definitions    |
| `swaggerSchemas`         | Reusable OpenAPI schemas     |
| `swaggerQueryParameters` | Reusable query parameters    |

## Common Setup Checklist

1. Install the package.
2. Add `express.json()`.
3. Call `configureLogger()` once.
4. Mount `app.use(logger())` before routes.
5. Wrap async controllers with `asyncHandler()`.
6. Return success responses with `response()`.
7. Throw `AppError` classes for known errors.
8. Mount `notFoundMiddleware` after routes.
9. Mount `errorMiddleware` last.
10. Add Swagger only when API docs are needed.

## Links

- npm: [api-core-backend](https://www.npmjs.com/package/api-core-backend)
- Repository: [gitlab.com/chochkimhour/api-core-backend](https://gitlab.com/chochkimhour/api-core-backend)

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
