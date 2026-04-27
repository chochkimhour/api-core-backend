import type { OpenApiParameter } from "./types";

export const pageQueryParameter: OpenApiParameter = {
  name: "page",
  in: "query",
  description: "Page number for page-based pagination. Kept for compatibility.",
  required: false,
  schema: {
    type: "integer",
    example: 1,
  },
};

export const limitQueryParameter: OpenApiParameter = {
  name: "limit",
  in: "query",
  description: "Maximum number of records to return. Alias for max.",
  required: false,
  schema: {
    type: "integer",
    example: 10,
  },
};

export const maxQueryParameter: OpenApiParameter = {
  name: "max",
  in: "query",
  description: "Maximum number of records to return.",
  required: false,
  schema: {
    type: "integer",
    example: 10,
  },
};

export const offsetQueryParameter: OpenApiParameter = {
  name: "offset",
  in: "query",
  description: "Number of records to skip.",
  required: false,
  schema: {
    type: "integer",
    example: 0,
  },
};

export const sortByQueryParameter: OpenApiParameter = {
  name: "sortBy",
  in: "query",
  description: "Field name to sort by.",
  required: false,
  schema: {
    type: "string",
    example: "createdAt",
  },
};

export const sortOrderQueryParameter: OpenApiParameter = {
  name: "sortOrder",
  in: "query",
  description: "Sort direction.",
  required: false,
  schema: {
    type: "string",
    enum: ["asc", "desc"],
    example: "desc",
  },
};

export const qQueryParameter: OpenApiParameter = {
  name: "q",
  in: "query",
  description: "Search keyword.",
  required: false,
  schema: {
    type: "string",
    example: "student",
  },
};

export const searchQueryParameter: OpenApiParameter = {
  name: "search",
  in: "query",
  description: "Search keyword. Alias for q.",
  required: false,
  schema: {
    type: "string",
    example: "student",
  },
};

export const swaggerQueryParameters = {
  Page: pageQueryParameter,
  Limit: limitQueryParameter,
  Max: maxQueryParameter,
  Offset: offsetQueryParameter,
  SortBy: sortByQueryParameter,
  SortOrder: sortOrderQueryParameter,
  Q: qQueryParameter,
  Search: searchQueryParameter,
} as const;
