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

  const isNarrow = useNarrowViewport();
  useTreeSelectionPopup(mapRef, selection, handlePopupClose, !isNarrow);

  const toggleSpecies = (value: string) => {
    setSelectedSpecies((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

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
