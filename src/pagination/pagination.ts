import type {
  NormalizedPagination,
  PaginationMeta,
  PaginationOptions,
  PaginationQuery,
} from "../types/pagination.types";
import type { SortOrder } from "../types/query.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function toPositiveInteger(value: unknown, fallback: number): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toNonNegativeInteger(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function toSafeString(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeSortOrder(value: unknown): SortOrder | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "asc" || normalized === "desc" ? normalized : undefined;
}

/** Normalizes raw pagination query parameters into safe numeric values. */
export function normalizePaginationQuery(
  query: PaginationQuery = {},
  options: PaginationOptions = {},
): NormalizedPagination {
  const defaultPage = options.defaultPage ?? DEFAULT_PAGE;
  const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? MAX_LIMIT;

  const page = toPositiveInteger(query.page, defaultPage);
  const requestedLimit = toPositiveInteger(query.limit, defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);
  const offset = (page - 1) * limit;
  const sortBy = toSafeString(query.sortBy);
  const sortOrder = normalizeSortOrder(query.sortOrder);

  return {
    page,
    limit,
    offset,
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
  };
}

/** Returns normalized pagination settings for repository or service queries. */
export function getPagination(
  query: PaginationQuery = {},
  options: PaginationOptions = {},
): NormalizedPagination {
  return normalizePaginationQuery(query, options);
}

/** Builds pagination metadata for API responses. */
export function getPaginationMeta(input: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  const page = toPositiveInteger(input.page, DEFAULT_PAGE);
  const limit = toPositiveInteger(input.limit, DEFAULT_LIMIT);
  const total = toNonNegativeInteger(input.total);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}
