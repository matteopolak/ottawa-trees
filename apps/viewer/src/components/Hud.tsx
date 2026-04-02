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
  onLocateUser: () => void;
}

export function Hud({
  dateRange,
  dateCutoff,
  onDateCutoffChange,
  species,
  selectedSpecies,
  onToggleSpecies,
  speciesPanelOpen,
  onSpeciesPanelOpenChange,
  onLocateUser
}: HudProps) {
  const selectedCount = selectedSpecies.length;

  return (
    <div className="hud">
      <div className="hud-locate-row">
        <div className="hud-cards-stack">
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
            <div className="hud-meta hud-meta--cutoff">
              <span className="hud-meta__label">Show trees planted/recorded before</span>
              <span className="hud-meta-badge">{toIsoDate(dateCutoff) ?? "Any"}</span>
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
        </div>

        <button
          type="button"
          className="hud-locate"
          onClick={onLocateUser}
          aria-label="Zoom to my location"
        >
          <svg className="hud-locate__icon" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
            />
          </svg>
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
