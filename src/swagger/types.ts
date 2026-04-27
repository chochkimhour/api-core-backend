export type OpenApiVersion = "3.0.0" | "3.0.1" | "3.0.2" | "3.0.3" | "3.1.0";

export interface OpenApiServer {
  url: string;
  description?: string;
}

export interface OpenApiTag {
  name: string;
  description?: string;
}

export interface OpenApiSchema {
  type?: string;
  format?: string;
  description?: string;
  example?: unknown;
  nullable?: boolean;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  items?: OpenApiSchema;
  additionalProperties?: boolean | OpenApiSchema;
  enum?: unknown[];
  oneOf?: OpenApiSchema[];
  allOf?: OpenApiSchema[];
  $ref?: string;
}

export interface OpenApiParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema: OpenApiSchema;
  example?: unknown;
}

export interface OpenApiComponents {
  schemas?: Record<string, OpenApiSchema>;
  parameters?: Record<string, OpenApiParameter>;
  [key: string]: unknown;
}

export interface OpenApiDocument {
  openapi: OpenApiVersion;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: OpenApiServer[];
  tags?: OpenApiTag[];
  paths: Record<string, unknown>;
  components?: OpenApiComponents;
  [key: string]: unknown;
}

export interface CreateSwaggerSpecOptions {
  title: string;
  version: string;
  description?: string;
  servers?: OpenApiServer[];
  tags?: OpenApiTag[];
  openapi?: OpenApiVersion;
  paths?: Record<string, unknown>;
  components?: OpenApiComponents;
}

export interface SetupSwaggerDocsOptions extends CreateSwaggerSpecOptions {
  path?: string;
  spec?: OpenApiDocument;
  swaggerUiOptions?: Record<string, unknown>;
}

export interface ExpressLikeApp {
  use: (...args: unknown[]) => unknown;
  get?: (...args: unknown[]) => unknown;
}
