import { describe, expect, it } from "vitest";
import { createMetadataCollector } from "./metadata";

describe("createMetadataCollector", () => {
  it("collects sorted unique species and date range", () => {
    const collector = createMetadataCollector();
    collector.add({ SPECIES: "Maple Norway", TREE_DATE_TS: 100 });
    collector.add({ SPECIES: "Elm Siberian", TREE_DATE_TS: 50 });
    collector.add({ SPECIES: "Maple Norway", TREE_DATE_TS: 200 });
    collector.add({ SPECIES: null, TREE_DATE_TS: null });

    const metadata = collector.build();
    expect(metadata.species).toEqual(["Elm Siberian", "Maple Norway"]);
    expect(metadata.dateRange).toEqual({ min: 50, max: 200 });
  });

  it("handles empty datasets", () => {
    const collector = createMetadataCollector();
    expect(collector.build()).toEqual({
      species: [],
      dateRange: { min: null, max: null }
    });
  });
});
