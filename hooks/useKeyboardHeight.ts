import { useEffect, useState } from "react";

/**
 * Returns the current on-screen keyboard height in pixels.
 * Uses the VisualViewport API — reliable on iOS Safari and Android Chrome.
 * Returns 0 when the keyboard is closed or the API is unavailable.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const kh = window.innerHeight - vv.height - vv.offsetTop;
      setHeight(Math.max(0, kh));
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return height;
}
