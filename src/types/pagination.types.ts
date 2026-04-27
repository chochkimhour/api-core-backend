import type { SortOrder } from "./query.types";
import type { QueryValue } from "./query.types";

export interface PaginationQuery {
  page?: QueryValue;
  limit?: QueryValue;
  offset?: QueryValue;
  sortBy?: QueryValue;
  sortOrder?: SortOrder | string | null;
}

export interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
