import type { LngLatLike } from "maplibre-gl";

export interface TreeFeatureProperties {
  SPECIES?: string | null;
  SPECIES_CAT?: string | null;
  TREE_COLOR?: string | null;
  DBH?: number | null;
  ADDNUM?: string | null;
  ADDSTR?: string | null;
  OWNERSHIP?: string | null;
  LTLOCATION?: string | null;
  STATUS?: string | null;
  WARD?: number | null;
  PARK?: number | null;
  PLNTDATE?: string | null;
  CREATEDATE?: string | null;
  TREE_DATE_TS?: number | null;
}

export interface DateRange {
  min: number | null;
  max: number | null;
}

export interface TreeSelection {
  properties: TreeFeatureProperties;
  lngLat: LngLatLike;
}
