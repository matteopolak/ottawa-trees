interface SpeciesFilterPanelProps {
  open: boolean;
  onClose: () => void;
  species: string[];
  selectedSpecies: string[];
  onToggle: (value: string) => void;
}

export function SpeciesFilterPanel({
  open,
  onClose,
  species,
  selectedSpecies,
  onToggle
}: SpeciesFilterPanelProps) {
  if (!open) return null;

  return (
    <>
      <button type="button" className="species-panel-backdrop" aria-label="Close" onClick={onClose} />
      <div className="species-panel" role="dialog" aria-modal="true" aria-labelledby="species-panel-title">
        <h2 id="species-panel-title" className="species-panel__title">
          Tree type
        </h2>
        <div className="species-list">
          {species.map((item) => (
            <label key={item}>
              <input type="checkbox" checked={selectedSpecies.includes(item)} onChange={() => onToggle(item)} />
              {item}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
