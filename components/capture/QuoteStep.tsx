"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useVisualViewport } from "@/hooks/useVisualViewport";

interface Props {
  imageDataUrl: string | null;
  onSubmit: (text: string) => void;
  onBack: () => void;
}

export default function QuoteStep({ imageDataUrl: _imageDataUrl, onSubmit, onBack }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { top, height } = useVisualViewport();

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

  return (
    // Container tracks the visual viewport exactly — stays locked to the
    // visible area whether or not the keyboard is open.
    <div
      style={{ position: "fixed", left: 0, right: 0, top, height }}
      className="bg-white flex flex-col overflow-hidden"
    >
      {/* Top stack — always visible at the top of the visual viewport */}
      <div className="px-5 pt-14 shrink-0">
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

      {/* Pushes button to the bottom of the visible area */}
      <div className="flex-1 min-h-0" />

      {/* Continue — fades in on first keystroke, always at visible bottom */}
      <div
        className="px-5 pb-8 shrink-0"
        style={{
          opacity: hasText ? 1 : 0,
          pointerEvents: hasText ? "auto" : "none",
          transition: "opacity 0.2s ease-out",
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
