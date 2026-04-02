import { describe, expect, it } from "vitest";
import { buildMapFilter } from "./mapFilters";

describe("buildMapFilter", () => {
  it("returns species filter only when no date threshold", () => {
    expect(buildMapFilter(["Maple Norway"], null)).toEqual([
      "all",
      ["in", ["get", "SPECIES"], ["literal", ["Maple Norway"]]]
    ]);
  });

  it("returns oldest threshold filter when no species", () => {
    expect(buildMapFilter([], 100)).toEqual([
      "all",
      ["<=", ["coalesce", ["to-number", ["get", "TREE_DATE_TS"]], Number.MAX_SAFE_INTEGER], 100]
    ]);
  });

  it("combines species and oldest threshold", () => {
    expect(buildMapFilter(["Elm"], 200)).toEqual([
      "all",
      ["in", ["get", "SPECIES"], ["literal", ["Elm"]]],
      ["<=", ["coalesce", ["to-number", ["get", "TREE_DATE_TS"]], Number.MAX_SAFE_INTEGER], 200]
    ]);
  });
});
