import { useEffect, useRef, type RefObject } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { PMTiles, type Protocol } from "pmtiles";
import type { MapFilterExpression } from "@trees/shared";
import { activeLayerId } from "../map/constants";
import { createMapStyle } from "../map/createMapStyle";
import type { TreeFeatureProperties, TreeSelection } from "../types";
import type { MutableRefObject } from "react";

function resolvePmtilesUrl(): string {
  const raw = import.meta.env.VITE_PMTILES_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (trimmed) {
    return trimmed;
  }
  return `${window.location.origin}/trees.pmtiles`;
}

interface UseTreeMapOptions {
  filterExpression: MapFilterExpression;
  onSelectionChange: (selection: TreeSelection | null) => void;
  protocolRef: MutableRefObject<Protocol | null>;
  mapTheme: "dark" | "light";
}

export function useTreeMap(
  containerRef: RefObject<HTMLDivElement | null>,
  {
    filterExpression,
    onSelectionChange,
    protocolRef,
    mapTheme
  }: UseTreeMapOptions
) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const pmtilesUrl = resolvePmtilesUrl();
    const pmtiles = new PMTiles(pmtilesUrl);
    protocolRef.current?.add(pmtiles);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createMapStyle(pmtilesUrl, mapTheme),
      center: [-75.6972, 45.4215],
      zoom: 12
    });

    const handleClick = (event: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: [activeLayerId] });
      const feature = features[0];
      if (!feature) {
        onSelectionChangeRef.current(null);
        return;
      }
      const properties = feature.properties as TreeFeatureProperties;
      onSelectionChangeRef.current({
        properties,
        lngLat: event.lngLat
      });
    };

    map.on("click", handleClick);
    map.on("mouseenter", activeLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", activeLayerId, () => {
      map.getCanvas().style.cursor = "";
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, protocolRef, mapTheme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer(activeLayerId)) {
      map.setFilter(activeLayerId, filterExpression as maplibregl.FilterSpecification);
    }
  }, [filterExpression]);

  return mapRef;
}
