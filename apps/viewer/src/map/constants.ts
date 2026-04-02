import type { ExpressionSpecification } from "maplibre-gl";

export const sourceId = "trees";
export const osmSourceId = "osm";
export const osmLayerId = "osm-basemap";
export const baseLayerId = "trees-base";
export const activeLayerId = "trees-active";
export const backgroundLayerId = "background";
export const protocolId = "pmtiles";

export const treeCircleColor: ExpressionSpecification = [
  "coalesce",
  ["get", "TREE_COLOR"],
  "#8fa090"
];
