"use client";

import { X } from "lucide-react";

interface Props {
  imageDataUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
  onClose: () => void;
}

export default function ConfirmStep({
  imageDataUrl,
  onConfirm,
  onRetake,
  onClose,
}: Props) {
  return (
    <div className="absolute inset-0 bg-[#e8e6e1] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3 shrink-0">
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full bg-black/8 flex items-center justify-center"
        >
          <X size={16} strokeWidth={2} className="text-neutral-700" />
        </button>
      </div>

      {/* Image preview in same rounded container */}
      <div
        className="mx-5 flex-1 overflow-hidden relative"
        style={{ borderRadius: 36 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="Captured photo"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Action buttons */}
      <div className="shrink-0 pb-10 pt-5 px-5 flex flex-col items-center gap-3">
        <button
          onClick={onConfirm}
          className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-transform"
        >
          Quote it
        </button>
        <button
          onClick={onRetake}
          className="text-neutral-500 text-[14px] font-medium py-1.5"
        >
          Retake it
        </button>
      </div>
    </div>
  );
}
