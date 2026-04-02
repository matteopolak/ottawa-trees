import type {
  RasterSourceSpecification,
  StyleSpecification,
  VectorSourceSpecification
} from "maplibre-gl";
import {
  activeLayerId,
  backgroundLayerId,
  baseLayerId,
  osmLayerId,
  osmSourceId,
  sourceId,
  treeCircleColor
} from "./constants";

export type MapVisualTheme = "dark" | "light";

interface ThemePaint {
  backgroundColor: string;
  raster: {
    "raster-saturation": number;
    "raster-contrast": number;
    "raster-brightness-min"?: number;
    "raster-brightness-max"?: number;
  };
  activeStrokeColor: string;
  activeStrokeOpacity: number;
}

function themePaint(theme: MapVisualTheme): ThemePaint {
  if (theme === "dark") {
    return {
      backgroundColor: "#0c0f0d",
      raster: {
        "raster-saturation": -1,
        "raster-contrast": 0.15,
        "raster-brightness-min": 0.15,
        "raster-brightness-max": 0.55
      },
      activeStrokeColor: "#f0f4f1",
      activeStrokeOpacity: 0.35
    };
  }
  return {
    backgroundColor: "#ececea",
    raster: {
      "raster-saturation": -1,
      "raster-contrast": -0.2
    },
    activeStrokeColor: "#1a1a1a",
    activeStrokeOpacity: 0.45
  };
}

export function createMapStyle(pmtilesUrl: string, theme: MapVisualTheme): StyleSpecification {
  const paint = themePaint(theme);
  return {
    version: 8 as const,
    sources: {
      [osmSourceId]: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      } satisfies RasterSourceSpecification,
      [sourceId]: {
        type: "vector",
        url: `pmtiles://${pmtilesUrl}`,
        attribution:
          'Contains information licensed under the <a href="https://ottawa.ca/en/city-hall/open-transparent-and-accountable-government/open-data/open-data-licence-version-20">Open Government Licence – City of Ottawa</a>. Tree data: <a href="https://open.ottawa.ca/datasets/tree-inventory/explore">City of Ottawa Tree Inventory</a>.'
      } satisfies VectorSourceSpecification
    },
    layers: [
      {
        id: backgroundLayerId,
        type: "background",
        paint: { "background-color": paint.backgroundColor }
      },
      {
        id: osmLayerId,
        type: "raster",
        source: osmSourceId,
        minzoom: 0,
        maxzoom: 22,
        paint: paint.raster
      },
      {
        id: baseLayerId,
        type: "circle",
        source: sourceId,
        "source-layer": "trees",
        paint: {
          "circle-color": treeCircleColor,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 2.2, 16, 5],
          "circle-opacity": 0.55
        }
      },
      {
        id: activeLayerId,
        type: "circle",
        source: sourceId,
        "source-layer": "trees",
        paint: {
          "circle-color": treeCircleColor,
          "circle-stroke-color": paint.activeStrokeColor,
          "circle-stroke-opacity": paint.activeStrokeOpacity,
          "circle-stroke-width": 2,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3.2, 16, 8],
          "circle-opacity": 1
        }
      }
    ]
  } as StyleSpecification;
}
