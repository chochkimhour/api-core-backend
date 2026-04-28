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

  it("paginates arrays and keeps the full total", () => {
    const users = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

    expect(paginate(users, { max: 2, offset: 1 })).toEqual({
      data: [{ id: 2 }, { id: 3 }],
      total: 5,
    });
  });

  it("builds pagination metadata", () => {
    expect(getPaginationMeta({ max: 10, offset: 10, total: 21 })).toEqual({
      max: 10,
      offset: 10,
      total: 21,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it("falls back to zero for invalid pagination totals", () => {
    expect(
      getPaginationMeta({ max: 10, offset: 0, total: undefined as never }),
    ).toEqual({
      max: 10,
      offset: 0,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
