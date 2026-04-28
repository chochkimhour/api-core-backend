import type {
  NormalizedPagination,
  PaginatedData,
  PaginationMeta,
  PaginationOptions,
  PaginationQuery,
} from "../types/pagination.types";
import type { SortOrder } from "../types/query.types";

const DEFAULT_MAX = 10;
const MAX_MAX = 100;

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
  const defaultMax = options.defaultMax ?? DEFAULT_MAX;
  const maxMax = options.maxMax ?? MAX_MAX;

  const requestedMax = toPositiveInteger(query.max, defaultMax);
  const max = Math.min(requestedMax, maxMax);
  const offset = toNonNegativeInteger(query.offset);
  const sortBy = toSafeString(query.sortBy);
  const sortOrder = normalizeSortOrder(query.sortOrder);

  return {
    max,
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

/** Slices an array using normalized pagination and includes the full total. */
export function paginate<T>(
  items: T[],
  pagination: Pick<NormalizedPagination, "max" | "offset">,
): PaginatedData<T> {
  return {
    data: items.slice(pagination.offset, pagination.offset + pagination.max),
    total: items.length,
  };
}

/** Builds pagination metadata for API responses. */
export function getPaginationMeta(input: {
  max?: number;
  offset?: number;
  total: number;
}): PaginationMeta {
  const max = toPositiveInteger(input.max, DEFAULT_MAX);
  const offset = toNonNegativeInteger(input.offset);
  const total = toNonNegativeInteger(input.total);

  return {
    max,
    offset,
    total,
    hasNextPage: offset + max < total,
    hasPreviousPage: offset > 0 && total > 0,
  };
}
