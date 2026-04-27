import type { SortOrder } from "./query.types";
import type { QueryValue } from "./query.types";

export interface PaginationQuery {
  page?: QueryValue;
  limit?: QueryValue;
  max?: QueryValue;
  offset?: QueryValue;
  sortBy?: QueryValue;
  sortOrder?: SortOrder | string | null;
}

export interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  defaultMax?: number;
  maxLimit?: number;
  maxMax?: number;
}

export interface NormalizedPagination {
  max: number;
  offset: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginationMeta {
  page: number;
  max: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
