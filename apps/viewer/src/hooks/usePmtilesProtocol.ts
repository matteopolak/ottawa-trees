import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { protocolId } from "../map/constants";

export function usePmtilesProtocol() {
  const protocolRef = useRef<Protocol | null>(null);

  useEffect(() => {
    const protocol = new Protocol();
    protocolRef.current = protocol;
    maplibregl.addProtocol(protocolId, protocol.tile);
    return () => {
      maplibregl.removeProtocol(protocolId);
      protocolRef.current = null;
    };
  }, []);

  return protocolRef;
}
