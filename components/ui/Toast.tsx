"use client";

import { X } from "lucide-react";
import { useToastState, ToastType } from "@/context/ToastContext";

const BG: Record<ToastType, string> = {
  success: "bg-neutral-900 text-white",
  info: "bg-white text-neutral-900 border border-neutral-100 shadow-md",
  error: "bg-red-500 text-white",
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastState();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="absolute top-14 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`
            flex items-center gap-2 rounded-full pl-4 pr-3 py-2.5
            text-[13px] font-semibold pointer-events-auto
            ${BG[toast.type]}
          `}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="opacity-50 hover:opacity-100 transition-opacity p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
