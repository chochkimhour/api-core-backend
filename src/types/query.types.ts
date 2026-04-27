export type SortOrder = "asc" | "desc";

export interface SortQuery {
  sortBy?: string;
  sortOrder?: SortOrder | string;
}

export type FilterQuery = Record<string, unknown>;

export interface SearchQuery {
  q?: string;
  search?: string;
}
