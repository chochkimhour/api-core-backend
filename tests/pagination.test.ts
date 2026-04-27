import { describe, expect, it } from "vitest";
import {
  getPagination,
  getPaginationMeta,
  normalizePaginationQuery,
} from "../src";

describe("pagination utilities", () => {
  it("normalizes valid pagination input", () => {
    expect(
      getPagination({
        page: "2",
        limit: "20",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    ).toEqual({
      page: 2,
      limit: 20,
      offset: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("trims sort fields and accepts uppercase sort order", () => {
    expect(
      getPagination({
        page: " 3 ",
        limit: " 5 ",
        sortBy: " createdAt ",
        sortOrder: "DESC",
      }),
    ).toEqual({
      page: 3,
      limit: 5,
      offset: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("falls back for invalid values", () => {
    expect(
      normalizePaginationQuery({
        page: "bad",
        limit: "-1",
        sortOrder: "sideways",
      }),
    ).toEqual({
      page: 1,
      limit: 10,
      offset: 0,
    });
  });

  it("caps limit at the maximum", () => {
    expect(getPagination({ limit: "999" })).toMatchObject({
      limit: 100,
      offset: 0,
    });
  });

  it("builds pagination metadata", () => {
    expect(getPaginationMeta({ page: 2, limit: 10, total: 21 })).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("falls back to zero for invalid pagination totals", () => {
    expect(
      getPaginationMeta({ page: 1, limit: 10, total: undefined as never }),
    ).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
