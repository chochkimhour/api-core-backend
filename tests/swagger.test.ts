import { describe, expect, it } from "vitest";
import {
  createSwaggerSpec,
  errorResponseSchema,
  maxQueryParameter,
  offsetQueryParameter,
  paginatedResponseSchema,
  paginationMetadataSchema,
  qQueryParameter,
  searchQueryParameter,
  sortByQueryParameter,
  sortOrderQueryParameter,
  swaggerRoute,
  swaggerRoutes,
  successResponseSchema,
  swaggerQueryParameters,
  swaggerSchemas,
  validationErrorResponseSchema,
} from "../src/swagger";

describe("swagger helpers", () => {
  it("exports reusable response schemas", () => {
    expect(successResponseSchema).toMatchObject({
      type: "object",
      required: [
        "success",
        "statusCode",
        "message",
        "data",
        "total",
        "timestamp",
      ],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
        total: { type: "integer", example: 20 },
        timestamp: { example: "2026-04-27 21:59:03" },
      },
    });

    expect(errorResponseSchema.properties?.error).toMatchObject({
      type: "string",
      example: "INTERNAL_SERVER_ERROR",
    });

    expect(validationErrorResponseSchema.properties?.errors).toMatchObject({
      type: "array",
    });

    expect(paginatedResponseSchema.allOf).toHaveLength(2);
    expect(paginationMetadataSchema.properties).toMatchObject({
      max: { type: "integer", example: 10 },
      offset: { type: "integer", example: 0 },
      total: { type: "integer", example: 100 },
    });
  });

  it("exports reusable query parameters", () => {
    expect(maxQueryParameter).toMatchObject({
      name: "max",
      in: "query",
      required: false,
    });
    expect(offsetQueryParameter).toMatchObject({
      name: "offset",
      in: "query",
      required: false,
    });
    expect(sortByQueryParameter.name).toBe("sortBy");
    expect(sortOrderQueryParameter.schema.enum).toEqual(["asc", "desc"]);
    expect(qQueryParameter.name).toBe("q");
    expect(searchQueryParameter.name).toBe("search");
    expect(swaggerQueryParameters).toHaveProperty("Max");
    expect(swaggerQueryParameters).toHaveProperty("Offset");
    expect(swaggerQueryParameters).toHaveProperty("SortBy");
    expect(swaggerQueryParameters).toHaveProperty("SortOrder");
    expect(swaggerQueryParameters).toHaveProperty("Q");
    expect(swaggerQueryParameters).toHaveProperty("Search");
  });

  it("creates an OpenAPI spec with default schemas and parameters", () => {
    const spec = createSwaggerSpec({
      title: "API Core Backend",
      version: "1.0.0",
      description: "Backend helper API",
      servers: [{ url: "http://localhost:3000" }],
      tags: [{ name: "Users" }],
    });

    expect(spec).toMatchObject({
      openapi: "3.0.3",
      info: {
        title: "API Core Backend",
        version: "1.0.0",
        description: "Backend helper API",
      },
      servers: [{ url: "http://localhost:3000" }],
      tags: [{ name: "Users" }],
      paths: {},
    });
    expect(spec.components?.schemas).toMatchObject(swaggerSchemas);
    expect(spec.components?.parameters).toMatchObject(swaggerQueryParameters);
  });

  it("creates route paths with simple route helpers", () => {
    expect(
      swaggerRoute({
        path: "/users",
        tag: "Users",
        summary: "Get users",
        parameters: [{ $ref: "#/components/parameters/Max" }],
        responseSchemaRef: "#/components/schemas/PaginatedResponse",
      }),
    ).toMatchObject({
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get users",
          parameters: [{ $ref: "#/components/parameters/Max" }],
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/PaginatedResponse" },
                },
              },
            },
          },
        },
      },
    });

    expect(
      swaggerRoutes([
        { path: "/users", method: "get", summary: "List users" },
        { path: "/users", method: "post", summary: "Create user" },
      ]),
    ).toMatchObject({
      "/users": {
        get: { summary: "List users" },
        post: { summary: "Create user" },
      },
    });
  });

  it("creates an OpenAPI spec from simple routes", () => {
    const spec = createSwaggerSpec({
      title: "API Core Backend",
      version: "1.0.0",
      routes: [
        {
          path: "/users",
          tag: "Users",
          summary: "Get users",
        },
      ],
    });

    expect(spec.paths).toMatchObject({
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get users",
        },
      },
    });
  });
});
