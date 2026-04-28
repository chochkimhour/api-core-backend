import type { SortOrder } from "./query.types";
import type { QueryValue } from "./query.types";

export interface PaginationQuery {
  max?: QueryValue;
  offset?: QueryValue;
  sortBy?: QueryValue;
  sortOrder?: SortOrder | string | null;
}

export interface PaginationOptions {
  defaultMax?: number;
  maxMax?: number;
}

export interface NormalizedPagination {
  max: number;
  offset: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginationMeta {
  max: number;
  offset: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
}
