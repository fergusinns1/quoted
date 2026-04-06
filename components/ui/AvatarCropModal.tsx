"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Check } from "lucide-react";

interface Props {
  file: File;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

/**
 * Simple circular avatar crop modal.
 * Renders the image on a canvas; user can drag to reposition and
 * pinch/scroll to zoom. Exports a 400×400 JPEG blob of the circle crop.
 */
export default function AvatarCropModal({ file, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

  // Crop state: offset of image top-left relative to canvas, and scale
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

  const CANVAS = 300; // display canvas size (CSS px)
  const OUTPUT = 400; // exported image size

  // Load image once
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Initial scale: fit the smaller image dimension to fill the circle
      const initScale = Math.max(CANVAS / img.width, CANVAS / img.height);
      const initX = (CANVAS - img.width * initScale) / 2;
      const initY = (CANVAS - img.height * initScale) / 2;
      setScale(initScale);
      setOffset({ x: initX, y: initY });
      setImgEl(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file]);

  // Redraw canvas whenever image / offset / scale changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = CANVAS * dpr;
    canvas.height = CANVAS * dpr;
    canvas.style.width = `${CANVAS}px`;
    canvas.style.height = `${CANVAS}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, CANVAS, CANVAS);

    // Draw image
    ctx.save();
    ctx.drawImage(
      imgEl,
      offset.x, offset.y,
      imgEl.width * scale, imgEl.height * scale
    );
    ctx.restore();

    // Circular mask — darken outside the circle
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS, CANVAS);
    ctx.arc(CANVAS / 2, CANVAS / 2, CANVAS / 2, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fill("evenodd");
    ctx.restore();

    // Circle border
    ctx.beginPath();
    ctx.arc(CANVAS / 2, CANVAS / 2, CANVAS / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [imgEl, offset, scale]);

  // ── Clamp helpers ──────────────────────────────────────────────────────────
  const clamp = useCallback(
    (x: number, y: number) => {
      if (!imgEl) return { x, y };
      const iw = imgEl.width * scale;
      const ih = imgEl.height * scale;
      return {
        x: Math.min(0, Math.max(CANVAS - iw, x)),
        y: Math.min(0, Math.max(CANVAS - ih, y)),
      };
    },
    [imgEl, scale]
  );

  // ── Mouse drag ─────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => clamp(o.x + dx, o.y + dy));
  };
  const onMouseUp = () => { dragging.current = false; };

  // ── Touch drag + pinch ─────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setOffset((o) => clamp(o.x + dx, o.y + dy));
    }
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      setScale((s) => {
        if (!imgEl) return s;
        const minScale = Math.max(CANVAS / imgEl.width, CANVAS / imgEl.height);
        return Math.max(minScale, Math.min(s * delta, minScale * 5));
      });
    }
  };
  const onTouchEnd = () => {
    dragging.current = false;
    lastPinchDist.current = null;
  };

  // ── Scroll to zoom ─────────────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      if (!imgEl) return s;
      const minScale = Math.max(CANVAS / imgEl.width, CANVAS / imgEl.height);
      return Math.max(minScale, Math.min(s * (e.deltaY < 0 ? 1.08 : 0.93), minScale * 5));
    });
  };

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!imgEl) return;
    const out = document.createElement("canvas");
    out.width = OUTPUT;
    out.height = OUTPUT;
    const ctx = out.getContext("2d")!;
    const ratio = OUTPUT / CANVAS;

    // Circular clip
    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      imgEl,
      offset.x * ratio, offset.y * ratio,
      imgEl.width * scale * ratio, imgEl.height * scale * ratio
    );

    out.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden w-[340px] flex flex-col shadow-2xl">
        {/* Title */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-neutral-900 dark:text-white text-[16px] font-semibold">Adjust photo</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <X size={14} strokeWidth={2} className="text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <p className="text-neutral-400 dark:text-neutral-500 text-[12px] text-center pb-3">
          Drag to reposition · Pinch or scroll to zoom
        </p>

        {/* Canvas */}
        <div className="flex justify-center pb-5 px-5">
          <canvas
            ref={canvasRef}
            style={{ width: CANVAS, height: CANVAS, borderRadius: "50%", cursor: "grab", touchAction: "none" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-[14px]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!imgEl}
            className="flex-1 rounded-full py-3 bg-neutral-900 text-white font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-30"
          >
            <Check size={15} strokeWidth={2.5} />
            Use photo
          </button>
        </div>
      </div>
    </div>
  );
}
