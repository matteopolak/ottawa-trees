const missingDateFallback = Number.MAX_SAFE_INTEGER;
export type MapFilterExpression = ["all", ...unknown[]];

export function buildMapFilter(species: string[], maxTreeDateTs: number | null): MapFilterExpression {
  const clauses: unknown[] = [];
  if (species.length > 0) {
    clauses.push(["in", ["get", "SPECIES"], ["literal", species]]);
  }
  if (typeof maxTreeDateTs === "number") {
    clauses.push(["<=", ["coalesce", ["to-number", ["get", "TREE_DATE_TS"]], missingDateFallback], maxTreeDateTs]);
  }
  return ["all", ...clauses];
}
