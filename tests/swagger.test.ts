import { describe, expect, it } from "vitest";
import {
  createSwaggerSpec,
  errorResponseSchema,
  limitQueryParameter,
  paginatedResponseSchema,
  paginationMetadataSchema,
  qQueryParameter,
  searchQueryParameter,
  sortByQueryParameter,
  sortOrderQueryParameter,
  successResponseSchema,
  swaggerQueryParameters,
  swaggerSchemas,
  validationErrorResponseSchema,
} from "../src/swagger";

describe("swagger helpers", () => {
  it("exports reusable response schemas", () => {
    expect(successResponseSchema).toMatchObject({
      type: "object",
      required: ["success", "statusCode", "message", "data", "timestamp"],
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "integer", example: 200 },
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
      page: { type: "integer", example: 1 },
      max: { type: "integer", example: 10 },
      total: { type: "integer", example: 100 },
    });
  });

  it("exports reusable query parameters", () => {
    expect(limitQueryParameter).toMatchObject({
      name: "limit",
      in: "query",
      required: false,
    });
    expect(sortByQueryParameter.name).toBe("sortBy");
    expect(sortOrderQueryParameter.schema.enum).toEqual(["asc", "desc"]);
    expect(qQueryParameter.name).toBe("q");
    expect(searchQueryParameter.name).toBe("search");
    expect(swaggerQueryParameters).toHaveProperty("Page");
    expect(swaggerQueryParameters).toHaveProperty("Limit");
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
});
