"use client";

import { useEffect, useRef } from "react";
import { X, Camera, Upload, RefreshCw } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

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
      if (dataUrl) {
        stop();
        onCapture(dataUrl);
      }
    };
    reader.onerror = () => {};
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const isActive = status === "active";
  const isRequesting = status === "idle" || status === "requesting";
  const isFallback =
    status === "denied" || status === "unavailable" || status === "error";

  return (
    <div className="absolute inset-0 bg-[#e8e6e1] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 shrink-0">
        <button
          onClick={onClose}
          aria-label="Close camera"
          className="w-9 h-9 rounded-full bg-black/8 flex items-center justify-center"
        >
          <X size={16} strokeWidth={2} className="text-neutral-700" />
        </button>
      </div>

      {/* Camera viewfinder container */}
      <div
        className="mx-5 flex-1 overflow-hidden bg-neutral-200/60 relative"
        style={{ borderRadius: 36 }}
      >
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

        {isRequesting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-300/60 flex items-center justify-center">
              <Camera size={26} className="text-neutral-500" strokeWidth={1.4} />
            </div>
            <p className="text-neutral-500 text-sm text-center">
              Requesting camera access…
            </p>
          </div>
        )}

        {isFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8">
            <div className="w-16 h-16 rounded-full bg-neutral-300/60 flex items-center justify-center">
              <Camera size={26} className="text-neutral-500" strokeWidth={1.4} />
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
                <Upload size={15} />
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
      </div>

      {/* Controls below container */}
      <div className="shrink-0 py-7 flex flex-col items-center gap-3">
        {isActive && (
          <>
            <button
              onClick={handleShutter}
              aria-label="Take photo"
              className="w-[68px] h-[68px] rounded-full bg-neutral-900 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-[52px] h-[52px] rounded-full border-[2.5px] border-white/50" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-neutral-400 text-[12px]"
            >
              <Upload size={11} />
              Upload instead
            </button>
          </>
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
