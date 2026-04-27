export type SortOrder = "asc" | "desc";

export type QueryValue = string | number | boolean | null | undefined;

export interface SortQuery {
  sortBy?: QueryValue;
  sortOrder?: SortOrder | string | null;
}

export type FilterQuery = Record<string, unknown>;

export interface SearchQuery {
  q?: QueryValue;
  search?: QueryValue;
}
