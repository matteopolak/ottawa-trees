import { TreeDetailCard } from "./TreeDetailCard";
import type { TreeFeatureProperties } from "../types";

interface TreeDetailBottomSheetProps {
  open: boolean;
  onClose: () => void;
  properties: TreeFeatureProperties;
}

export function TreeDetailBottomSheet({
  open,
  onClose,
  properties
}: TreeDetailBottomSheetProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="tree-sheet-backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="tree-sheet" role="dialog" aria-modal="true" aria-label="Tree details">
        <button
          type="button"
          className="tree-sheet__close"
          aria-label="Close tree details"
          onClick={onClose}
        >
          ×
        </button>
        <TreeDetailCard properties={properties} />
      </div>
    </>
  );
}
