"use client";

import { useEffect, useRef } from "react";
import { X, Camera, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function FrostedIconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
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
      style={{
        border: "3px solid rgba(255,255,255,0.7)",
        padding: 4,
      }}
    >
      <div className="w-full h-full rounded-full bg-white shadow-sm" />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CameraStep({ onCapture, onClose }: Props) {
  const { status, videoRef, streamRef, start, stop, capture } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "active" && videoRef.current && streamRef.current) {
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  }, [status, videoRef, streamRef]);

  const handleShutter = () => {
    const dataUrl = capture();
    if (dataUrl) {
      stop();
      onCapture(dataUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) { stop(); onCapture(dataUrl); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const isActive = status === "active";
  const isRequesting = status === "idle" || status === "requesting";
  const isFallback = status === "denied" || status === "unavailable" || status === "error";

  return (
    <div className="absolute inset-0 bg-white">
      {/* Camera viewport — 6 px white inset acts as the border frame */}
      <div
        className="absolute inset-[6px] overflow-hidden bg-neutral-200"
        style={{ borderRadius: 38 }}
      >
        {/* Live video */}
        {isActive && (
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

        {/* Requesting state */}
        {isRequesting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-100">
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
              <Camera size={26} className="text-neutral-400" strokeWidth={1.4} />
            </div>
            <p className="text-neutral-500 text-sm">Requesting camera…</p>
          </div>
        )}

        {/* Fallback / denied state */}
        {isFallback && (
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
            <div className="flex flex-col items-center gap-2.5 w-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-full px-7 py-3.5 bg-neutral-900 text-white font-semibold text-sm w-full justify-center active:scale-[0.97] transition-transform"
              >
                <ImageIcon size={15} />
                Upload photo
              </button>
              {status === "denied" && (
                <button
                  onClick={() => start()}
                  className="flex items-center gap-1.5 text-neutral-400 text-xs"
                >
                  <RefreshCw size={12} />
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom fog gradient — only over live camera */}
        {isActive && (
          <div
            className="absolute bottom-0 inset-x-0 h-[38%] pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.44) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        )}

        {/* Floating controls */}
        {isActive && (
          <div className="absolute bottom-9 inset-x-0 flex items-center justify-between px-8">
            <FrostedIconButton onClick={onClose} label="Close camera">
              <X size={17} strokeWidth={2} className="text-white" />
            </FrostedIconButton>

            <ShutterButton onClick={handleShutter} />

            <FrostedIconButton
              onClick={() => fileInputRef.current?.click()}
              label="Upload from gallery"
            >
              <ImageIcon size={16} strokeWidth={1.8} className="text-white" />
            </FrostedIconButton>
          </div>
        )}

        {/* Non-active close button (requesting / fallback) */}
        {!isActive && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 left-5 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
          >
            <X size={16} strokeWidth={2} className="text-neutral-600" />
          </button>
        )}
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
