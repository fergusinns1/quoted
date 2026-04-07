"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { compressImage } from "@/lib/imageUtils";

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

function FrostedIconButton({
  onClick, label, children,
}: {
  onClick: () => void; label: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      style={{
        background: "rgba(255,255,255,0.13)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.22)",
      }}
    >
      {children}
    </button>
  );
}

function ShutterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Take photo"
      className="w-[72px] h-[72px] rounded-full flex items-center justify-center active:scale-95 transition-transform"
      style={{ border: "3px solid rgba(255,255,255,0.7)", padding: 4 }}
    >
      <div className="w-full h-full rounded-full bg-white shadow-sm" />
    </button>
  );
}

export default function CameraStep({ onCapture, onClose }: Props) {
  const { status, videoRef, streamRef, start, stop, capture } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  // Compression runs in the background immediately at shutter press
  const compressedRef = useRef<Promise<string> | null>(null);

  // Whether the confirm layout has animated in
  const [confirmed, setConfirmed] = useState(false);
  // Exit fade before handing off to next step
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "active" && videoRef.current && streamRef.current) {
      if (!videoRef.current.srcObject) videoRef.current.srcObject = streamRef.current;
    }
  }, [status, videoRef, streamRef]);

  const doCapture = (dataUrl: string) => {
    stop();
    setCapturedUrl(dataUrl);
    // Start compression immediately — will be ready long before user taps "Quote it"
    compressedRef.current = compressImage(dataUrl);
    // Two rAFs to ensure height transition starts after paint
    requestAnimationFrame(() => requestAnimationFrame(() => setConfirmed(true)));
  };

  const handleShutter = () => {
    const dataUrl = capture();
    if (dataUrl) doCapture(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) doCapture(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRetake = () => {
    setExiting(false);
    setConfirmed(false);
    setCapturedUrl(null);
    compressedRef.current = null;
    setTimeout(() => start(), 350);
  };

  const handleConfirm = async () => {
    if (!capturedUrl) return;
    // Fade the whole screen out, then hand off (compression is already done)
    setExiting(true);
    const compressed = compressedRef.current
      ? await compressedRef.current
      : capturedUrl;
    // Small delay so the fade is visible before unmount
    setTimeout(() => onCapture(compressed), 220);
  };

  const isActive = status === "active";
  const isRequesting = status === "idle" || status === "requesting";
  const isFallback = status === "denied" || status === "unavailable" || status === "error";

  const viewportHeight = confirmed
    ? "calc(72dvh - 6px)"
    : "calc(100% - 12px)";

  return (
    <div
      className="absolute inset-0 bg-white flex flex-col overflow-hidden"
      style={{
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.2s ease-out" : "none",
      }}
    >
      {/* ── Image/video viewport ── */}
      <div
        className="mx-[6px] mt-[6px] overflow-hidden bg-neutral-200 shrink-0 relative"
        style={{
          borderRadius: 38,
          height: viewportHeight,
          transition: "height 1.5s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Captured still — fades in instantly over the frozen video frame */}
        {capturedUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedUrl}
            alt="Captured photo"
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        )}

        {/* Live video */}
        {!capturedUrl && isActive && (
          <video
            ref={(el) => {
              (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
              if (el && streamRef.current) el.srcObject = streamRef.current;
            }}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Requesting */}
        {isRequesting && !capturedUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-100">
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
              <Camera size={26} className="text-neutral-400" strokeWidth={1.4} />
            </div>
            <p className="text-neutral-500 text-sm">Requesting camera…</p>
          </div>
        )}

        {/* Fallback */}
        {isFallback && !capturedUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 bg-neutral-100">
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
              <Camera size={26} className="text-neutral-400" strokeWidth={1.4} />
            </div>
            <div className="text-center">
              <p className="text-neutral-700 text-[16px] font-semibold mb-1.5">
                {status === "denied" ? "Camera access denied" : "No camera available"}
              </p>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {status === "denied"
                  ? "Enable access in your browser settings, or upload a photo."
                  : "Upload a photo from your device to continue."}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full px-7 py-3.5 bg-neutral-900 text-white font-semibold text-sm w-full justify-center active:scale-[0.97] transition-transform"
            >
              <ImageIcon size={15} />
              Upload photo
            </button>
            {status === "denied" && (
              <button onClick={() => start()} className="flex items-center gap-1.5 text-neutral-400 text-xs">
                <RefreshCw size={12} /> Try again
              </button>
            )}
          </div>
        )}

        {/* Bottom fog + camera controls */}
        {isActive && !capturedUrl && (
          <>
            <div
              className="absolute bottom-0 inset-x-0 h-[38%] pointer-events-none z-10"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.44) 0%, rgba(0,0,0,0) 100%)" }}
            />
            <div className="absolute bottom-9 inset-x-0 flex items-center justify-between px-8 z-20">
              <FrostedIconButton onClick={onClose} label="Close camera">
                <X size={17} strokeWidth={2} className="text-white" />
              </FrostedIconButton>
              <ShutterButton onClick={handleShutter} />
              <FrostedIconButton onClick={() => fileInputRef.current?.click()} label="Upload from gallery">
                <ImageIcon size={16} strokeWidth={1.8} className="text-white" />
              </FrostedIconButton>
            </div>
          </>
        )}

        {/* Non-active close */}
        {!isActive && !capturedUrl && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 left-5 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center z-10"
          >
            <X size={16} strokeWidth={2} className="text-neutral-600" />
          </button>
        )}
      </div>

      {/* ── Confirm buttons — fade + slide in after viewport settles ── */}
      <div
        className="flex-1 flex flex-col justify-center px-5 gap-2.5"
        style={{
          opacity: confirmed ? 1 : 0,
          transform: confirmed ? "translateY(0)" : "translateY(20px)",
          // Delay matches the bulk of the 1.5s height transition
          transition: confirmed
            ? "opacity 0.3s ease 1.1s, transform 0.35s cubic-bezier(0.32, 0.72, 0, 1) 1.05s"
            : "none",
          pointerEvents: confirmed ? "auto" : "none",
        }}
      >
        <button
          onClick={handleConfirm}
          className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Quote it
        </button>
        <button
          onClick={handleRetake}
          className="w-full rounded-full py-4 bg-neutral-100 text-neutral-700 font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Retake it
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
