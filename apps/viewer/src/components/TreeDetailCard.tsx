import { toIsoDate } from "@trees/shared";
import type { TreeFeatureProperties } from "../types";

function formatTreeDate(properties: TreeFeatureProperties): string {
  const ts = typeof properties.TREE_DATE_TS === "number" ? properties.TREE_DATE_TS : null;
  return toIsoDate(ts) ?? "Unknown";
}

interface TreeDetailCardProps {
  properties: TreeFeatureProperties;
}

export function TreeDetailCard({ properties }: TreeDetailCardProps) {
  return (
    <div className="tree-card">
      <h2 className="tree-card__title">{properties.SPECIES ?? "Unknown species"}</h2>
      <dl className="tree-card__dl">
        <dt>Diameter (DBH)</dt>
        <dd>{properties.DBH ?? "Unknown"}</dd>
        <dt>Date</dt>
        <dd>{formatTreeDate(properties)}</dd>
        <dt>Address</dt>
        <dd>{`${properties.ADDNUM ?? ""} ${properties.ADDSTR ?? ""}`.trim() || "Unknown"}</dd>
        <dt>Location</dt>
        <dd>{properties.LTLOCATION ?? "Unknown"}</dd>
        <dt>Ownership</dt>
        <dd>{properties.OWNERSHIP ?? "Unknown"}</dd>
        <dt>Status</dt>
        <dd>{properties.STATUS ?? "Unknown"}</dd>
        <dt>Ward</dt>
        <dd>{properties.WARD ?? "Unknown"}</dd>
      </dl>
    </div>
  );
}
