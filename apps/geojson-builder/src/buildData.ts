import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getTreeDateTimestamp } from "@trees/shared";
import { buildTreeColorLookup, speciesCategory } from "./colorPalette";
import { createMetadataCollector } from "./metadata";

interface TreeProperties {
  SPECIES?: string | null;
  PLNTDATE?: string | null;
  CREATEDATE?: string | null;
  [key: string]: unknown;
}

interface TreeFeature {
  type: "Feature";
  geometry: unknown;
  properties: TreeProperties;
}
interface FeatureCollection {
  type: "FeatureCollection";
  features: TreeFeature[];
}

const workspaceRoot = path.resolve(process.cwd(), "../..");
const defaultInput = path.join(workspaceRoot, "data/raw/trees.geojson");
const inputPath = process.env.TREES_GEOJSON_PATH
  ? path.resolve(process.env.TREES_GEOJSON_PATH)
  : defaultInput;
const viewerPublicDir = path.join(workspaceRoot, "apps/viewer/public");
const metadataDir = path.join(viewerPublicDir, "metadata");
const transformedGeojsonPath = path.join(process.cwd(), "dist/trees.enriched.geojson");
const pmtilesPath = path.join(viewerPublicDir, "trees.pmtiles");

async function buildData() {
  await mkdir(path.dirname(transformedGeojsonPath), { recursive: true });
  await mkdir(metadataDir, { recursive: true });

  const sourceRaw = await readFile(inputPath, "utf8");
  const source = JSON.parse(sourceRaw) as FeatureCollection;
  const collector = createMetadataCollector();
  const speciesByCategory = new Map<string, string[]>();

  for (const feature of source.features) {
    const treeDateTs = getTreeDateTimestamp(feature.properties);
    feature.properties.TREE_DATE_TS = treeDateTs;

    const speciesRaw = typeof feature.properties.SPECIES === "string" ? feature.properties.SPECIES : "";
    const cat = speciesCategory(speciesRaw || null);
    const list = speciesByCategory.get(cat);
    if (list) {
      list.push(speciesRaw);
    } else {
      speciesByCategory.set(cat, [speciesRaw]);
    }

    collector.add({
      SPECIES: typeof feature.properties.SPECIES === "string" ? feature.properties.SPECIES : null,
      TREE_DATE_TS: treeDateTs
    });
  }

  const treeColorLookup = buildTreeColorLookup(speciesByCategory);
  for (const feature of source.features) {
    const speciesRaw = typeof feature.properties.SPECIES === "string" ? feature.properties.SPECIES : "";
    feature.properties.SPECIES_CAT = speciesCategory(speciesRaw || null);
    feature.properties.TREE_COLOR = treeColorLookup.get(speciesRaw) ?? "#7a7a7a";
  }
  await writeFile(transformedGeojsonPath, JSON.stringify(source));

  const metadata = collector.build();
  await writeFile(path.join(metadataDir, "species.json"), JSON.stringify(metadata.species, null, 2));
  await writeFile(path.join(metadataDir, "dateRange.json"), JSON.stringify(metadata.dateRange, null, 2));

  const tippecanoe = spawnSync(
    "tippecanoe",
    [
      "--force",
      `--output=${pmtilesPath}`,
      "--layer=trees",
      "--minimum-zoom=6",
      "--maximum-zoom=16",
      "--drop-densest-as-needed",
      "--exclude-all",
      "--include=SPECIES",
      "--include=DBH",
      "--include=ADDNUM",
      "--include=ADDSTR",
      "--include=OWNERSHIP",
      "--include=LTLOCATION",
      "--include=STATUS",
      "--include=WARD",
      "--include=PARK",
      "--include=PLNTDATE",
      "--include=CREATEDATE",
      "--include=TREE_DATE_TS",
      "--include=SPECIES_CAT",
      "--include=TREE_COLOR",
      transformedGeojsonPath
    ],
    { stdio: "inherit" }
  );

  if (tippecanoe.status !== 0) {
    throw new Error("tippecanoe failed while building PMTiles");
  }
}

buildData().catch((error) => {
  console.error(error);
  process.exit(1);
});
