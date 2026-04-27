import type { SortOrder } from "./query.types";

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  offset?: string | number;
  sortBy?: string;
  sortOrder?: SortOrder | string;
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
