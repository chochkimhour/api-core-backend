import type { SwaggerRouteOptions } from "./types";

export function swaggerRoute(
  options: SwaggerRouteOptions,
): Record<string, unknown> {
  const method = options.method ?? "get";
  const tags = options.tags ?? (options.tag ? [options.tag] : undefined);
  const operation: Record<string, unknown> = {
    ...(tags ? { tags } : {}),
    ...(options.summary ? { summary: options.summary } : {}),
    ...(options.description ? { description: options.description } : {}),
    ...(options.parameters ? { parameters: options.parameters } : {}),
    ...(options.requestBodySchemaRef
      ? {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: options.requestBodySchemaRef },
              },
            },
          },
        }
      : {}),
    responses: {
      200: {
        description: options.responseDescription ?? "Successful response",
        content: {
          "application/json": {
            schema: {
              $ref:
                options.responseSchemaRef ??
                "#/components/schemas/SuccessResponse",
            },
          },
        },
      },
    },
  };

  return {
    [options.path]: {
      [method]: operation,
    },
  };
}

export function swaggerRoutes(
  routes: SwaggerRouteOptions[],
): Record<string, unknown> {
  return routes.reduce<Record<string, unknown>>((paths, route) => {
    const nextPath = swaggerRoute(route);

    for (const [path, methods] of Object.entries(nextPath)) {
      paths[path] = {
        ...((paths[path] as Record<string, unknown> | undefined) ?? {}),
        ...(methods as Record<string, unknown>),
      };
    }

    return paths;
  }, {});
}
