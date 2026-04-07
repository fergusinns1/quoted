"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCaptureFlow } from "@/context/CaptureContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { saveQuote } from "@/lib/quotesApi";
import { compressImage } from "@/lib/imageUtils";
import CameraStep from "./CameraStep";
import QuoteStep from "./QuoteStep";
import PersonStep from "./PersonStep";

type Step = "camera" | "quote" | "person";

export default function CaptureFlow() {
  const { isOpen, closeCapture } = useCaptureFlow();
  const router = useRouter();
  const showToast = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("camera");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [quoteText, setQuoteText] = useState("");

  const reset = useCallback(() => {
    setStep("camera");
    setImageDataUrl(null);
    setQuoteText("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    closeCapture();
  }, [reset, closeCapture]);

  // Called by CameraStep only after the user taps "Quote it"
  const handleImageCaptured = useCallback(async (dataUrl: string) => {
    const compressed = await compressImage(dataUrl);
    setImageDataUrl(compressed);
    setStep("quote");
  }, []);

  const handleQuoteSubmit = useCallback((text: string) => {
    setQuoteText(text);
    setStep("person");
  }, []);

  const handleSave = useCallback(
    async (speaker: string) => {
      if (!user) {
        reset();
        closeCapture();
        router.push("/auth/signin");
        return;
      }

      const record = {
        id: crypto.randomUUID(),
        text: quoteText,
        speaker,
        imageDataUrl,
        createdAt: Date.now(),
      };

      try {
        await saveQuote(record, user.id);
        window.dispatchEvent(new Event("quotd:changed"));
        reset();
        closeCapture();
        showToast("Quote saved");
        router.push("/quotes");
      } catch {
        showToast("Failed to save quote. Please try again.", "error");
      }
    },
    [quoteText, imageDataUrl, user, reset, closeCapture, router, showToast]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">
      {step === "camera" && (
        <CameraStep onCapture={handleImageCaptured} onClose={handleClose} />
      )}
      {step === "quote" && (
        <QuoteStep
          imageDataUrl={imageDataUrl}
          onSubmit={handleQuoteSubmit}
          onBack={() => setStep("camera")}
        />
      )}
      {step === "person" && (
        <PersonStep
          imageDataUrl={imageDataUrl}
          quoteText={quoteText}
          onSave={handleSave}
          onBack={() => setStep("quote")}
        />
      )}
    </div>
  );
}
