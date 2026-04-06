"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
        onClick={onCancel}
        aria-label="Cancel"
      />

      {/* Sheet */}
      <div className="relative w-full px-4 pb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 pt-6 pb-5 text-center">
            <p className="text-neutral-900 dark:text-white font-bold text-[16px] mb-1.5">
              {title}
            </p>
            <p className="text-neutral-400 dark:text-neutral-500 text-[13px] leading-relaxed">
              {message}
            </p>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 flex">
            <button
              onClick={onCancel}
              className="flex-1 py-4 text-neutral-600 dark:text-neutral-300 font-medium text-[14px] border-r border-neutral-100 dark:border-neutral-800 active:bg-neutral-50 dark:active:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-4 font-semibold text-[14px] active:bg-neutral-50 dark:active:bg-neutral-800 ${
                destructive ? "text-red-500" : "text-blue-500"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
