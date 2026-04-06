"use client";

interface Props {
  imageDataUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
}

export default function ConfirmStep({ imageDataUrl, onConfirm, onRetake }: Props) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Image — top section, same 6 px inset border as camera state */}
      <div
        className="mx-[6px] mt-[6px] overflow-hidden shrink-0"
        style={{
          borderRadius: 38,
          // Matches camera frame feel; height is ~70 % of viewport
          height: "calc(70dvh - 6px)",
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
        className="flex-1 flex flex-col justify-center px-5 gap-3"
        style={{
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
