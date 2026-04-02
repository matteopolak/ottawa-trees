import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type VectorSourceSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PMTiles, Protocol } from "pmtiles";
import { buildMapFilter, toIsoDate } from "@trees/shared";

interface TreeFeatureProperties {
  SPECIES?: string | null;
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

interface DateRange {
  min: number | null;
  max: number | null;
}

const sourceId = "trees";
const baseLayerId = "trees-base";
const activeLayerId = "trees-active";
const protocolId = "pmtiles";

function formatTreeDate(properties: TreeFeatureProperties): string {
  const ts = typeof properties.TREE_DATE_TS === "number" ? properties.TREE_DATE_TS : null;
  return toIsoDate(ts) ?? "Unknown";
}

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const protocolRef = useRef<Protocol | null>(null);
  const [species, setSpecies] = useState<string[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ min: null, max: null });
  const [dateCutoff, setDateCutoff] = useState<number | null>(null);
  const [selectedTree, setSelectedTree] = useState<TreeFeatureProperties | null>(null);

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

  useEffect(() => {
    const protocol = new Protocol();
    protocolRef.current = protocol;
    maplibregl.addProtocol(protocolId, protocol.tile);
    return () => {
      maplibregl.removeProtocol(protocolId);
      protocolRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const pmtilesUrl = `${window.location.origin}/trees.pmtiles`;
    const pmtiles = new PMTiles(pmtilesUrl);
    protocolRef.current?.add(pmtiles);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          [sourceId]: {
            type: "vector",
            url: `pmtiles://${pmtilesUrl}`
          } satisfies VectorSourceSpecification
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#f2f4f1" }
          },
          {
            id: baseLayerId,
            type: "circle",
            source: sourceId,
            "source-layer": "trees",
            paint: {
              "circle-color": "#8fa090",
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 1.8, 16, 4.2],
              "circle-opacity": 0.35
            }
          },
          {
            id: activeLayerId,
            type: "circle",
            source: sourceId,
            "source-layer": "trees",
            paint: {
              "circle-color": "#2c7a4b",
              "circle-stroke-color": "#f4fff7",
              "circle-stroke-width": 1,
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 2.5, 16, 6],
              "circle-opacity": 0.9
            }
          }
        ]
      },
      center: [-75.6972, 45.4215],
      zoom: 12
    });

    map.on("click", activeLayerId, (event) => {
      const feature = event.features?.[0];
      setSelectedTree((feature?.properties ?? null) as TreeFeatureProperties | null);
    });
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
  }, []);

  const filterExpression = useMemo(() => {
    return buildMapFilter(selectedSpecies, dateCutoff);
  }, [selectedSpecies, dateCutoff]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer(activeLayerId)) {
      map.setFilter(activeLayerId, filterExpression as any);
    }
  }, [filterExpression]);

  const toggleSpecies = (value: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  return (
    <div className="layout">
      <aside className="panel">
        <h1>Ottawa Tree Explorer</h1>
        <p>Find tree types, browse oldest trees, and plan your next walk.</p>

        <section>
          <h2>Oldest Trees</h2>
          <input
            type="range"
            min={dateRange.min ?? 0}
            max={dateRange.max ?? 0}
            step={24 * 60 * 60 * 1000}
            value={dateCutoff ?? dateRange.max ?? 0}
            disabled={dateRange.min === null || dateRange.max === null}
            onChange={(event) => {
              const value = Number(event.target.value);
              setDateCutoff(Number.isFinite(value) ? value : null);
            }}
          />
          <div className="meta">Show trees planted/recorded before: {toIsoDate(dateCutoff) ?? "Any"}</div>
        </section>

        <section>
          <h2>Tree Type</h2>
          <div className="species-list">
            {species.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={selectedSpecies.includes(item)}
                  onChange={() => toggleSpecies(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </section>

        {selectedTree ? (
          <section className="tree-card">
            <h2>{selectedTree.SPECIES ?? "Unknown species"}</h2>
            <dl>
              <dt>Diameter (DBH)</dt>
              <dd>{selectedTree.DBH ?? "Unknown"}</dd>
              <dt>Date</dt>
              <dd>{formatTreeDate(selectedTree)}</dd>
              <dt>Address</dt>
              <dd>{`${selectedTree.ADDNUM ?? ""} ${selectedTree.ADDSTR ?? ""}`.trim() || "Unknown"}</dd>
              <dt>Location</dt>
              <dd>{selectedTree.LTLOCATION ?? "Unknown"}</dd>
              <dt>Ownership</dt>
              <dd>{selectedTree.OWNERSHIP ?? "Unknown"}</dd>
              <dt>Status</dt>
              <dd>{selectedTree.STATUS ?? "Unknown"}</dd>
              <dt>Ward</dt>
              <dd>{selectedTree.WARD ?? "Unknown"}</dd>
            </dl>
          </section>
        ) : null}
      </aside>
      <main ref={mapContainerRef} className="map" />
    </div>
  );
}
