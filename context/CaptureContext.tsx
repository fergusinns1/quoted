"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface CaptureContextValue {
  isOpen: boolean;
  openCapture: () => void;
  closeCapture: () => void;
}

const CaptureContext = createContext<CaptureContextValue | null>(null);

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCapture = useCallback(() => setIsOpen(true), []);
  const closeCapture = useCallback(() => setIsOpen(false), []);

  return (
    <CaptureContext.Provider value={{ isOpen, openCapture, closeCapture }}>
      {children}
    </CaptureContext.Provider>
  );
}

export function useCaptureFlow(): CaptureContextValue {
  const ctx = useContext(CaptureContext);
  if (!ctx) {
    throw new Error("useCaptureFlow must be used inside <CaptureProvider>");
  }
  return ctx;
}
