import { describe, expect, it } from "vitest";
import { getFilters } from "../src";

describe("filter utility", () => {
  it("keeps only allowed filters", () => {
    expect(
      getFilters({ status: "ACTIVE", role: "ADMIN", password: "123" }, ["status", "role"])
    ).toEqual({
      status: "ACTIVE",
      role: "ADMIN"
    });
  });
});
