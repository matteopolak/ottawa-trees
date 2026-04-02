import { useCallback, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildMapFilter } from "@trees/shared";
import { Hud } from "./components/Hud";
import { usePmtilesProtocol } from "./hooks/usePmtilesProtocol";
import { useTreeMap } from "./hooks/useTreeMap";
import { useTreeMetadata } from "./hooks/useTreeMetadata";
import { TreeDetailBottomSheet } from "./components/TreeDetailBottomSheet";
import { useNarrowViewport } from "./hooks/useNarrowViewport";
import { useTreeSelectionPopup } from "./hooks/useTreeSelectionPopup";
import type { TreeSelection } from "./types";

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const protocolRef = usePmtilesProtocol();
  const { species, dateRange, dateCutoff, setDateCutoff } = useTreeMetadata();
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selection, setSelection] = useState<TreeSelection | null>(null);
  const [speciesPanelOpen, setSpeciesPanelOpen] = useState(false);

  const handleSelectionChange = useCallback((next: TreeSelection | null) => {
    setSelection(next);
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelection(null);
  }, []);

  const filterExpression = useMemo(() => {
    return buildMapFilter(selectedSpecies, dateCutoff);
  }, [selectedSpecies, dateCutoff]);

  const mapRef = useTreeMap(mapContainerRef, {
    filterExpression,
    onSelectionChange: handleSelectionChange,
    protocolRef,
    mapTheme: "dark"
  });

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      window.alert("Location is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapRef.current;
        if (!map) return;
        const center: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const opts = { center, zoom: 15 };
        const prefersReduced =
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
          map.jumpTo(opts);
        } else {
          map.flyTo({ ...opts, essential: true });
        }
      },
      () => {
        window.alert("Could not get your location. Check permissions and try again.");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  }, [mapRef]);

  const isNarrow = useNarrowViewport();
  useTreeSelectionPopup(mapRef, selection, handlePopupClose, !isNarrow);

  const toggleSpecies = (value: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleClearSpeciesSelection = useCallback(() => {
    setSelectedSpecies([]);
  }, []);

  return (
    <div className="app-shell">
      <Hud
        dateRange={dateRange}
        dateCutoff={dateCutoff}
        onDateCutoffChange={setDateCutoff}
        species={species}
        selectedSpecies={selectedSpecies}
        onToggleSpecies={toggleSpecies}
        speciesPanelOpen={speciesPanelOpen}
        onSpeciesPanelOpenChange={setSpeciesPanelOpen}
        onClearSpeciesSelection={handleClearSpeciesSelection}
        onLocateUser={handleLocateUser}
      />
      <main ref={mapContainerRef} className="map" />
      {isNarrow && selection ? (
        <TreeDetailBottomSheet
          open
          onClose={handlePopupClose}
          properties={selection.properties}
        />
      ) : null}
    </div>
  );
}
