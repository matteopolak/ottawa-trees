export interface TreeDateSource {
  PLNTDATE?: string | null;
  CREATEDATE?: string | null;
}

function parseDate(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getTreeDateTimestamp(source: TreeDateSource): number | null {
  const plantDate = parseDate(source.PLNTDATE);
  if (plantDate !== null) {
    return plantDate;
  }
  return parseDate(source.CREATEDATE);
}

export function toIsoDate(timestamp: number | null): string | null {
  if (timestamp === null) {
    return null;
  }
  return new Date(timestamp).toISOString().slice(0, 10);
}
