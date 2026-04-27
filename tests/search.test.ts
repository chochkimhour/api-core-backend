import { describe, expect, it } from "vitest";
import { getSearch } from "../src";

describe("search utility", () => {
  it("reads q", () => {
    expect(getSearch({ q: "student" })).toEqual({ keyword: "student" });
  });

  it("trims search keywords", () => {
    expect(getSearch({ q: " student " })).toEqual({ keyword: "student" });
  });

  it("reads search when q is missing", () => {
    expect(getSearch({ search: "course" })).toEqual({ keyword: "course" });
  });

  it("returns an empty object without a keyword", () => {
    expect(getSearch()).toEqual({});
  });
});
