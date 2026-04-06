"use client";

interface Props {
  imageDataUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
}

export default function ConfirmStep({ imageDataUrl, onConfirm, onRetake }: Props) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col px-[6px]" style={{ gap: "var(--gap)", paddingTop: "var(--gap)", paddingBottom: "var(--gap)" }}>
      <style>{`:root { --gap: clamp(10px, 3dvh, 24px); }`}</style>
      {/* Image — fills remaining space after buttons + gaps */}
      <div
        className="overflow-hidden"
        style={{
          borderRadius: 38,
          flex: 1,
          animation: "confirmSettle 0.72s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="Captured photo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Action buttons — fade in after image settles */}
      <div
        className="flex flex-col shrink-0 px-[3px]"
        style={{
          gap: "var(--gap)",
          animation: "fadeUp 0.3s ease-out 0.48s both",
        }}
      >
        <button
          onClick={onConfirm}
          className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Quote it
        </button>
        <button
          onClick={onRetake}
          className="w-full rounded-full py-4 bg-neutral-100 text-neutral-700 font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Retake it
        </button>
      </div>
    </div>
  );
}
