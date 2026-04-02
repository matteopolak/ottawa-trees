import { useEffect, useMemo, useRef, useState } from "react";

export type SpeciesFilterLayout = "popover" | "sheet";

interface SpeciesFilterPanelProps {
  open: boolean;
  onClose: () => void;
  species: string[];
  selectedSpecies: string[];
  onToggle: (value: string) => void;
  onClearSelection: () => void;
  layout: SpeciesFilterLayout;
}

export function SpeciesFilterPanel({
  open,
  onClose,
  species,
  selectedSpecies,
  onToggle,
  onClearSelection,
  layout
}: SpeciesFilterPanelProps) {
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    searchInputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filteredSpecies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return species;
    return species.filter((s) => s.toLowerCase().includes(q));
  }, [species, query]);

  if (!open) return null;

  const isSheet = layout === "sheet";
  const backdropClass = isSheet ? "species-sheet-backdrop" : "species-panel-backdrop";
  const panelClass = isSheet ? "species-sheet" : "species-panel species-panel--popover";

  return (
    <>
      <button type="button" className={backdropClass} aria-label="Close" onClick={onClose} />
      <div
        className={panelClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="species-panel-title"
      >
        {isSheet ? (
          <button type="button" className="species-sheet__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        ) : null}
        <div className="species-panel__header">
          <h2 id="species-panel-title" className="species-panel__title">
            Tree type
          </h2>
          {selectedSpecies.length > 0 ? (
            <button type="button" className="species-panel__clear" onClick={onClearSelection}>
              Clear selection
            </button>
          ) : null}
        </div>
        <input
          ref={searchInputRef}
          type="search"
          className="species-panel__search"
          placeholder="Filter tree types…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="species-list">
          {filteredSpecies.length === 0 ? (
            <p className="species-list__empty">No matches</p>
          ) : (
            filteredSpecies.map((item) => (
              <label key={item}>
                <input type="checkbox" checked={selectedSpecies.includes(item)} onChange={() => onToggle(item)} />
                {item}
              </label>
            ))
          )}
        </div>
      </div>
    </>
  );
}
