"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";

interface Props {
  imageDataUrl: string | null;
  onSubmit: (text: string) => void;
  onBack: () => void;
}

export default function QuoteStep({ imageDataUrl: _imageDataUrl, onSubmit, onBack }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardHeight = useKeyboardHeight();

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const hasText = text.trim().length > 0;
  const btnBottom = keyboardHeight > 0 ? keyboardHeight + 8 : 32;

  return (
    <div className="absolute inset-0 bg-white">
      {/* Top stack — locked to top, never moves */}
      <div className="px-5 pt-14">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center mb-5"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600" />
        </button>

        <h1 className="text-neutral-900 text-[32px] font-bold tracking-tight leading-tight mb-6">
          What was said?
        </h1>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
          }}
          placeholder="The quote goes here..."
          rows={5}
          className="w-full resize-none rounded-2xl bg-neutral-100 border-0 text-neutral-800 text-[16px] leading-relaxed placeholder-neutral-400 px-4 py-4 focus:outline-none"
        />
      </div>

      {/* Continue — fades in on first keystroke, hugs top of keyboard */}
      <div
        className="fixed left-0 right-0 px-5 transition-[bottom] duration-300 ease-out"
        style={{
          bottom: btnBottom,
          opacity: hasText ? 1 : 0,
          pointerEvents: hasText ? "auto" : "none",
          transition: "bottom 0.3s ease-out, opacity 0.2s ease-out",
        }}
      >
        <button
          onClick={handleSubmit}
          className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] active:scale-[0.98] transition-transform"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
