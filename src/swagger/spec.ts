import { swaggerQueryParameters } from "./parameters";
import { swaggerRoutes } from "./routes";
import { swaggerSchemas } from "./schemas";
import type { CreateSwaggerSpecOptions, OpenApiDocument } from "./types";

export function createSwaggerSpec(
  options: CreateSwaggerSpecOptions,
): OpenApiDocument {
  const routePaths = options.routes ? swaggerRoutes(options.routes) : {};

  return {
    openapi: options.openapi ?? "3.0.3",
    info: {
      title: options.title,
      version: options.version,
      ...(options.description ? { description: options.description } : {}),
    },
    ...(options.servers ? { servers: options.servers } : {}),
    ...(options.tags ? { tags: options.tags } : {}),
    paths: {
      ...routePaths,
      ...(options.paths ?? {}),
    },
    components: {
      ...options.components,
      schemas: {
        ...swaggerSchemas,
        ...options.components?.schemas,
      },
      parameters: {
        ...swaggerQueryParameters,
        ...options.components?.parameters,
      },
    },
  };
}
