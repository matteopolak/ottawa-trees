import { useEffect, useRef, type RefObject } from "react";
import { createRoot, type Root } from "react-dom/client";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { TreeDetailCard } from "../components/TreeDetailCard";
import type { TreeSelection } from "../types";

export function useTreeSelectionPopup(
  mapRef: RefObject<MapLibreMap | null>,
  selection: TreeSelection | null,
  onClose: () => void,
  enabled: boolean
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selection || !enabled) {
      return;
    }

    const container = document.createElement("div");
    container.className = "tree-popup-inner";

    const root: Root = createRoot(container);
    root.render(<TreeDetailCard properties={selection.properties} />);

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "min(94vw, 28rem)",
      className: "tree-popup"
    })
      .setLngLat(selection.lngLat)
      .setDOMContent(container)
      .addTo(map);

    popup.on("close", () => {
      onCloseRef.current();
    });

    return () => {
      root.unmount();
      popup.remove();
    };
  }, [mapRef, selection, enabled]);
}
