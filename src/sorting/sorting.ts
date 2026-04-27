import type { SortOrder, SortQuery } from "../types/query.types";

function normalizeSortOrder(value: unknown): SortOrder {
  return typeof value === "string" && value.trim().toLowerCase() === "desc"
    ? "desc"
    : "asc";
}

function toSafeString(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
}

/** Normalizes sorting query parameters. */
export function getSorting(query: SortQuery = {}): {
  sortBy?: string;
  sortOrder: SortOrder;
} {
  const sortBy = toSafeString(query.sortBy);

  return {
    ...(sortBy ? { sortBy } : {}),
    sortOrder: normalizeSortOrder(query.sortOrder),
  };
}
