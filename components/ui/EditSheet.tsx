"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface EditSheetProps {
  initialText: string;
  initialSpeaker: string;
  onSave: (text: string, speaker: string) => Promise<void>;
  onClose: () => void;
}

export default function EditSheet({
  initialText,
  initialSpeaker,
  onSave,
  onClose,
}: EditSheetProps) {
  const [text, setText] = useState(initialText);
  const [speaker, setSpeaker] = useState(initialSpeaker);
  const [saving, setSaving] = useState(false);

  const canSave =
    text.trim().length > 0 &&
    speaker.trim().length > 0 &&
    (text.trim() !== initialText || speaker.trim() !== initialSpeaker);

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave(text.trim(), speaker.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close editor"
      />

      {/* Sheet panel */}
      <div className="relative w-full bg-white rounded-t-3xl pt-4 pb-8 px-5 shadow-2xl">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-neutral-900 font-bold text-[17px]">Edit quote</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
          >
            <X size={15} className="text-neutral-500" />
          </button>
        </div>

        {/* Quote textarea */}
        <label className="block mb-1.5 text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
          Quote
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Quote text…"
          className="
            w-full resize-none rounded-2xl mb-4
            bg-neutral-50 border border-neutral-200
            text-neutral-800 text-[15px] leading-relaxed
            px-4 py-3
            focus:outline-none focus:border-neutral-400
          "
        />

        {/* Speaker input */}
        <label className="block mb-1.5 text-neutral-500 text-[11px] font-semibold uppercase tracking-wider">
          Person
        </label>
        <input
          type="text"
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Person's name…"
          className="
            w-full rounded-2xl mb-5
            bg-neutral-50 border border-neutral-200
            text-neutral-800 text-[15px]
            px-4 py-3
            focus:outline-none focus:border-neutral-400
          "
        />

        <button
          disabled={!canSave || saving}
          onClick={handleSave}
          className="
            w-full rounded-full py-3.5
            bg-neutral-900 text-white
            font-semibold text-[15px]
            disabled:opacity-35 disabled:cursor-not-allowed
            active:scale-[0.98] transition-transform
          "
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
