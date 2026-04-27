import type { SortOrder, SortQuery } from "../types/query.types";

function normalizeSortOrder(value: unknown): SortOrder {
  return value === "desc" ? "desc" : "asc";
}

/** Normalizes sorting query parameters. */
export function getSorting(query: SortQuery = {}): {
  sortBy?: string;
  sortOrder: SortOrder;
} {
  return {
    ...(query.sortBy ? { sortBy: query.sortBy } : {}),
    sortOrder: normalizeSortOrder(query.sortOrder)
  };
}
