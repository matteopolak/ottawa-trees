import { useEffect, useState } from "react";
import type { DateRange } from "../types";

export function useTreeMetadata() {
  const [species, setSpecies] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ min: null, max: null });
  const [dateCutoff, setDateCutoff] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/metadata/species.json").then((res) => res.json() as Promise<string[]>),
      fetch("/metadata/dateRange.json").then((res) => res.json() as Promise<DateRange>)
    ]).then(([speciesData, dateRangeData]) => {
      if (!mounted) return;
      setSpecies(speciesData);
      setDateRange(dateRangeData);
      setDateCutoff(dateRangeData.max);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { species, dateRange, dateCutoff, setDateCutoff };
}
