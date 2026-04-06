import { useEffect, useState } from "react";

/**
 * Tracks the VisualViewport rect (top offset + height).
 * On iOS Safari the visual viewport scrolls independently when the keyboard
 * opens, so syncing a container to this rect keeps it locked to the
 * visible area regardless of keyboard state.
 */
export function useVisualViewport() {
  const [vp, setVp] = useState<{ top: number; height: number }>(() => ({
    top: 0,
    height: typeof window !== "undefined" ? window.innerHeight : 812,
  }));

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () =>
      setVp({ top: Math.round(vv.offsetTop), height: Math.round(vv.height) });
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  return vp;
}
