"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { getAllQuotes } from "@/lib/db";
import { rankSpeakers } from "@/lib/utils";

interface Props {
  imageDataUrl: string | null;
  quoteText: string;
  onSave: (speaker: string) => Promise<void>;
  onBack: () => void;
}

export default function PersonStep({
  imageDataUrl: _imageDataUrl,
  quoteText,
  onSave,
  onBack,
}: Props) {
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);

    getAllQuotes()
      .then((quotes) => setSuggestions(rankSpeakers(quotes)))
      .catch(() => {});

    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Heading row */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-2 shrink-0">
        <button
          onClick={onBack}
          disabled={saving}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 disabled:opacity-50"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600" />
        </button>
        <h1 className="text-neutral-900 text-[28px] font-bold tracking-tight leading-tight">
          Said by
        </h1>
      </div>

      {/* Spacer — lets keyboard push content up on mobile */}
      <div className="flex-1" />

      {/* Input section — anchored near bottom */}
      <div className="px-5 pb-10 shrink-0 flex flex-col gap-3">
        {/* Quote preview */}
        <div className="rounded-2xl bg-neutral-50 border border-neutral-100 px-4 py-3.5">
          <p className="text-neutral-700 text-[14px] font-medium leading-snug line-clamp-2">
            &ldquo;{quoteText}&rdquo;
          </p>
        </div>

        {/* Name input */}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="e.g Fergus Inns"
          disabled={saving}
          autoComplete="off"
          className="
            w-full rounded-2xl bg-neutral-100 border-0
            text-neutral-800 text-[16px] placeholder-neutral-400
            px-4 py-4
            focus:outline-none
            disabled:opacity-60
          "
        />

        {/* Ranked suggestions */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto shell-scroll pb-0.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setName(s)}
                className={`
                  shrink-0 rounded-full px-4 py-2 text-[13px] font-medium
                  transition-colors border
                  ${
                    name === s
                      ? "bg-neutral-900 text-white border-transparent"
                      : "bg-white text-neutral-600 border-neutral-200 active:bg-neutral-100"
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Continue button */}
        <button
          disabled={!name.trim() || saving}
          onClick={handleSave}
          className="
            w-full rounded-full py-4
            bg-neutral-900 text-white font-semibold text-[15px]
            disabled:opacity-30 disabled:cursor-not-allowed
            active:scale-[0.98] transition-transform
          "
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
