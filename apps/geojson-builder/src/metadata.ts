export interface MetadataState {
  species: string[];
  dateRange: {
    min: number | null;
    max: number | null;
  };
}

interface Entry {
  SPECIES: string | null;
  TREE_DATE_TS: number | null;
}

export function createMetadataCollector() {
  const speciesSet = new Set<string>();
  let min: number | null = null;
  let max: number | null = null;

  return {
    add(entry: Entry) {
      if (entry.SPECIES) {
        speciesSet.add(entry.SPECIES);
      }
      if (typeof entry.TREE_DATE_TS === "number") {
        min = min === null ? entry.TREE_DATE_TS : Math.min(min, entry.TREE_DATE_TS);
        max = max === null ? entry.TREE_DATE_TS : Math.max(max, entry.TREE_DATE_TS);
      }
    },
    build(): MetadataState {
      return {
        species: [...speciesSet].sort((a, b) => a.localeCompare(b)),
        dateRange: {
          min,
          max
        }
      };
    }
  };
}
