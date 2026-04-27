import type { SearchQuery } from "../types/query.types";

function toKeyword(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const keyword = String(value).trim();
  return keyword.length > 0 ? keyword : undefined;
}

/** Extracts a search keyword from q or search query parameters. */
export function getSearch(query: SearchQuery = {}): { keyword?: string } {
  const keyword = toKeyword(query.q) ?? toKeyword(query.search);
  return keyword ? { keyword } : {};
}
