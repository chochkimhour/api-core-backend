import { createSwaggerSpec } from "./spec";
import type {
  ExpressLikeApp,
  OpenApiDocument,
  SetupSwaggerDocsOptions,
} from "./types";

type SwaggerUiExpress = {
  serve: unknown;
  setup: (spec: OpenApiDocument, options?: Record<string, unknown>) => unknown;
};

async function loadSwaggerUiExpress(): Promise<SwaggerUiExpress> {
  try {
    const dynamicImport = new Function(
      "specifier",
      "return import(specifier)",
    ) as (specifier: string) => Promise<{ default?: unknown }>;
    const module = await dynamicImport("swagger-ui-express");
    return (module.default ?? module) as SwaggerUiExpress;
  } catch (error) {
    throw new Error(
      "setupSwaggerDocs() requires the optional peer dependency swagger-ui-express. Install it with: npm install swagger-ui-express",
      { cause: error },
    );
  }
}

export function setupSwaggerDocs(
  app: ExpressLikeApp,
  options: SetupSwaggerDocsOptions,
): Promise<OpenApiDocument> {
  return setupSwaggerDocsAsync(app, options);
}

async function setupSwaggerDocsAsync(
  app: ExpressLikeApp,
  options: SetupSwaggerDocsOptions,
): Promise<OpenApiDocument> {
  const docsPath = options.path ?? "/api-docs";
  const spec = options.spec ?? createSwaggerSpec(options);
  const swaggerUi = await loadSwaggerUiExpress();

  app.use(
    docsPath,
    swaggerUi.serve,
    swaggerUi.setup(spec, options.swaggerUiOptions),
  );

  return spec;
}
