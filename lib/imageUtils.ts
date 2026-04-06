/**
 * In-browser image compression.
 * Resizes to maxWidth preserving aspect ratio, re-encodes as JPEG.
 * Safe to call with any data URL; resolves with the original if anything fails.
 */
export function compressImage(
  dataUrl: string,
  maxWidth = 1280,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl); // canvas unavailable — use original
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => resolve(dataUrl); // load failed — use original
    img.src = dataUrl;
  });
}

/** Approximate stored size in KB from a base64 data URL. */
export function estimateSizeKB(dataUrl: string): number {
  return Math.round((dataUrl.length * 3) / 4 / 1024);
}
