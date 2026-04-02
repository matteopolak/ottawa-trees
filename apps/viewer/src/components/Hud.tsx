import { toIsoDate } from "@trees/shared";
import type { DateRange } from "../types";
import { SpeciesFilterPanel } from "./SpeciesFilterPanel";

interface HudProps {
  dateRange: DateRange;
  dateCutoff: number | null;
  onDateCutoffChange: (value: number | null) => void;
  species: string[];
  selectedSpecies: string[];
  onToggleSpecies: (value: string) => void;
  speciesPanelOpen: boolean;
  onSpeciesPanelOpenChange: (open: boolean) => void;
}

export function Hud({
  dateRange,
  dateCutoff,
  onDateCutoffChange,
  species,
  selectedSpecies,
  onToggleSpecies,
  speciesPanelOpen,
  onSpeciesPanelOpenChange
}: HudProps) {
  const selectedCount = selectedSpecies.length;

  return (
    <div className="hud">
      <div className="hud-tile hud-tile--title">
        <h1 className="hud-title">Ottawa Tree Explorer</h1>
        <p className="hud-muted">Find tree types, browse oldest trees, and plan your next walk.</p>
      </div>

      <div className="hud-tile">
        <h2 className="hud-section-title">Oldest trees</h2>
        <input
          type="range"
          className="hud-range"
          min={dateRange.min ?? 0}
          max={dateRange.max ?? 0}
          step={24 * 60 * 60 * 1000}
          value={dateCutoff ?? dateRange.max ?? 0}
          disabled={dateRange.min === null || dateRange.max === null}
          onChange={(event) => {
            const value = Number(event.target.value);
            onDateCutoffChange(Number.isFinite(value) ? value : null);
          }}
        />
        <div className="hud-meta">
          Show trees planted/recorded before: {toIsoDate(dateCutoff) ?? "Any"}
        </div>
      </div>

      <div className="hud-actions">
        <button
          type="button"
          className="hud-button"
          onClick={() => onSpeciesPanelOpenChange(true)}
          aria-expanded={speciesPanelOpen}
        >
          Species
          {selectedCount > 0 ? (
            <span className="hud-button__badge" aria-hidden>
              {selectedCount}
            </span>
          ) : null}
        </button>
      </div>

      <SpeciesFilterPanel
        open={speciesPanelOpen}
        onClose={() => onSpeciesPanelOpenChange(false)}
        species={species}
        selectedSpecies={selectedSpecies}
        onToggle={onToggleSpecies}
      />
    </div>
  );
}
