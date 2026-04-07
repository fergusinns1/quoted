"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { getAllQuotes } from "@/lib/quotesApi";
import { rankSpeakers } from "@/lib/utils";

interface Props {
  imageDataUrl: string | null;
  quoteText: string;
  onSave: (speaker: string) => Promise<void>;
  onBack: () => void;
}

export default function PersonStep({
  imageDataUrl: _imageDataUrl,
  quoteText: _quoteText,
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

  // iOS Safari scrolls the document natively when a text input is focused,
  // bypassing overflow:hidden on body/html. Reset it immediately on every scroll
  // event to keep fixed elements locked in place.
  useEffect(() => {
    const reset = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    window.addEventListener("scroll", reset);
    return () => window.removeEventListener("scroll", reset);
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

  const hasName = name.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-white">
      <div className="px-5 pt-14">

        {/* Back arrow */}
        <button
          onClick={onBack}
          disabled={saving}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center mb-5 disabled:opacity-50"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600" />
        </button>

        {/* Title */}
        <h1 className="text-neutral-900 text-[32px] font-bold tracking-tight leading-tight mb-6">
          Who said it?
        </h1>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="e.g Fergus Inns"
          disabled={saving}
          autoComplete="off"
          className="w-full rounded-2xl bg-neutral-100 border-0 text-neutral-800 text-[16px] placeholder-neutral-400 px-4 py-4 focus:outline-none disabled:opacity-60"
        />

        {/* Suggestion pills */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto shell-scroll mt-4 pb-0.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setName(s)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors border ${
                  name === s
                    ? "bg-neutral-900 text-white border-transparent"
                    : "bg-white text-neutral-600 border-neutral-200 active:bg-neutral-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Save — always in layout, opacity-only toggle, never moves */}
        <div
          className="mt-3"
          style={{
            opacity: hasName ? 1 : 0,
            pointerEvents: hasName ? "auto" : "none",
            transition: "opacity 0.18s ease-out",
          }}
        >
          <button
            disabled={saving}
            onClick={handleSave}
            className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}
