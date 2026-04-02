import { describe, expect, it } from "vitest";
import { getTreeDateTimestamp, toIsoDate } from "./date";

describe("getTreeDateTimestamp", () => {
  it("prefers PLNTDATE when available", () => {
    const ts = getTreeDateTimestamp({
      PLNTDATE: "2001-01-01T00:00:00Z",
      CREATEDATE: "2015-01-01T00:00:00Z"
    });

    expect(ts).toBe(Date.parse("2001-01-01T00:00:00Z"));
  });

  it("falls back to CREATEDATE when PLNTDATE is missing", () => {
    const ts = getTreeDateTimestamp({
      PLNTDATE: null,
      CREATEDATE: "2015-01-01T00:00:00Z"
    });

    expect(ts).toBe(Date.parse("2015-01-01T00:00:00Z"));
  });

  it("returns null when no valid date exists", () => {
    const ts = getTreeDateTimestamp({
      PLNTDATE: "not-a-date",
      CREATEDATE: null
    });

    expect(ts).toBeNull();
  });
});

describe("toIsoDate", () => {
  it("formats unix timestamp as YYYY-MM-DD", () => {
    expect(toIsoDate(Date.parse("2020-07-04T12:10:00Z"))).toBe("2020-07-04");
  });

  it("returns null for null", () => {
    expect(toIsoDate(null)).toBeNull();
  });
});
