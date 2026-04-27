import { describe, expect, it } from "vitest";
import {
  getPagination,
  getPaginationMeta,
  normalizePaginationQuery,
  paginate,
} from "../src";

describe("pagination utilities", () => {
  it("normalizes valid pagination input", () => {
    expect(
      getPagination({
        max: "20",
        offset: "40",
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    ).toEqual({
      max: 20,
      offset: 40,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("trims sort fields and accepts uppercase sort order", () => {
    expect(
      getPagination({
        max: " 5 ",
        offset: " 10 ",
        sortBy: " createdAt ",
        sortOrder: "DESC",
      }),
    ).toEqual({
      max: 5,
      offset: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("falls back for invalid values", () => {
    expect(
      normalizePaginationQuery({
        page: "bad",
        max: "-1",
        offset: "-1",
        sortOrder: "sideways",
      }),
    ).toEqual({
      max: 10,
      offset: 0,
    });
  });

  it("caps max at the maximum", () => {
    expect(getPagination({ max: "999" })).toMatchObject({
      max: 100,
      offset: 0,
    });
  });

  it("supports limit as a compatibility alias for max", () => {
    expect(getPagination({ limit: "5", offset: "2" })).toEqual({
      max: 5,
      offset: 2,
    });
  });

  it("paginates arrays and keeps the full total", () => {
    const users = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

    expect(paginate(users, { max: 2, offset: 1 })).toEqual({
      data: [{ id: 2 }, { id: 3 }],
      total: 5,
    });
  });

  it("builds pagination metadata", () => {
    expect(getPaginationMeta({ page: 2, max: 10, total: 21 })).toEqual({
      page: 2,
      max: 10,
      total: 21,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("falls back to zero for invalid pagination totals", () => {
    expect(
      getPaginationMeta({ page: 1, max: 10, total: undefined as never }),
    ).toEqual({
      page: 1,
      max: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
