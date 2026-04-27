import type { FilterQuery } from "../types/query.types";

/** Picks only developer-approved filter fields from a query object. */
export function getFilters<TAllowedField extends string>(
  query: FilterQuery,
  allowedFields: readonly TAllowedField[]
): Partial<Record<TAllowedField, unknown>> {
  return allowedFields.reduce<Partial<Record<TAllowedField, unknown>>>((filters, field) => {
    if (query[field] !== undefined) {
      filters[field] = query[field];
    }

    return filters;
  }, {});
}
