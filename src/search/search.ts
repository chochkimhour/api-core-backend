import type { SearchQuery } from "../types/query.types";

/** Extracts a search keyword from q or search query parameters. */
export function getSearch(query: SearchQuery = {}): { keyword?: string } {
  const keyword = query.q ?? query.search;
  return keyword ? { keyword } : {};
}
