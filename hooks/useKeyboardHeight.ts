import { useEffect, useState } from "react";

/**
 * Returns the on-screen keyboard height in pixels via VisualViewport.
 * Uses window.innerHeight - vv.height which is reliable on iOS Safari and
 * Android Chrome. Returns 0 when the keyboard is closed or API unavailable.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () =>
      setHeight(Math.max(0, Math.round(window.innerHeight - vv.height)));
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, []);

  return height;
}
