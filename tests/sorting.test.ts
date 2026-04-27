import { describe, expect, it } from "vitest";
import { getSorting } from "../src";

describe("sorting utility", () => {
  it("returns sort fields", () => {
    expect(getSorting({ sortBy: "name", sortOrder: "asc" })).toEqual({
      sortBy: "name",
      sortOrder: "asc",
    });
  });

  it("trims sortBy and normalizes uppercase desc", () => {
    expect(getSorting({ sortBy: " name ", sortOrder: "DESC" })).toEqual({
      sortBy: "name",
      sortOrder: "desc",
    });
  });

  it("falls back to asc for invalid sort order", () => {
    expect(getSorting({ sortBy: "name", sortOrder: "invalid" })).toEqual({
      sortBy: "name",
      sortOrder: "asc",
    });
  });
});
