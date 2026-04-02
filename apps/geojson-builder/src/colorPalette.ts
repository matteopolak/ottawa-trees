/** First word of species string, or "Unknown". */
export function speciesCategory(species: string | null | undefined): string {
  if (!species || typeof species !== "string") return "Unknown";
  const first = species.trim().split(/\s+/)[0];
  return first || "Unknown";
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return [Math.round((rp + m) * 255), Math.round((gp + m) * 255), Math.round((bp + m) * 255)];
}

export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(((h % 360) + 360) % 360, s, l);
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Golden-angle hue steps for distinct categories. */
export function buildCategoryHueMap(categories: string[]): Map<string, number> {
  const sorted = [...categories].sort((a, b) => a.localeCompare(b));
  const golden = 137.508;
  const map = new Map<string, number>();
  sorted.forEach((cat, i) => {
    map.set(cat, (i * golden) % 360);
  });
  return map;
}

const SATURATION = 0.55;
const LIGHTNESS_MIN = 0.38;
const LIGHTNESS_MAX = 0.58;

export function buildTreeColorLookup(
  speciesByCategory: Map<string, string[]>
): Map<string, string> {
  const categories = [...speciesByCategory.keys()].sort((a, b) => a.localeCompare(b));
  const hueMap = buildCategoryHueMap(categories);
  const result = new Map<string, string>();

  for (const cat of categories) {
    const speciesList = speciesByCategory.get(cat);
    if (!speciesList) continue;
    const distinct = [...new Set(speciesList)].sort((a, b) => a.localeCompare(b));
    const n = distinct.length;
    distinct.forEach((sp, idx) => {
      const hue = hueMap.get(cat) ?? 0;
      const t = n <= 1 ? 0.5 : idx / (n - 1);
      const lightness = LIGHTNESS_MIN + t * (LIGHTNESS_MAX - LIGHTNESS_MIN);
      result.set(sp, hslToHex(hue, SATURATION, lightness));
    });
  }

  return result;
}
