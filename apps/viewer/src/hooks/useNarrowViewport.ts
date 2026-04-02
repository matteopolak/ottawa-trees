import { useSyncExternalStore } from "react";

/** Matches `max-width: 768px` in CSS — tree detail uses bottom sheet below this width. */
const NARROW_VIEWPORT_QUERY = "(max-width: 768px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(NARROW_VIEWPORT_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(NARROW_VIEWPORT_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useNarrowViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
