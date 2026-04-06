"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CaptureProvider } from "@/context/CaptureContext";
import { ToastProvider } from "@/context/ToastContext";
import { isDbAvailable } from "@/lib/db";
import MobileShell from "./MobileShell";
import BottomNav from "@/components/nav/BottomNav";
import CaptureFlow from "@/components/capture/CaptureFlow";
import ToastContainer from "@/components/ui/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [storageBlocked, setStorageBlocked] = useState(false);

  useEffect(() => {
    if (!isDbAvailable()) setStorageBlocked(true);
  }, []);

  return (
    <ToastProvider>
      <CaptureProvider>
        <MobileShell>
          {children}

          {/* Storage unavailable warning — sits above content, below nav */}
          {storageBlocked && (
            <div className="absolute bottom-[90px] left-4 right-4 z-30">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                <AlertTriangle
                  size={16}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <p className="text-amber-800 text-[12px] leading-snug">
                  Storage is unavailable in this browser context. Quotes
                  won&apos;t be saved across sessions.
                </p>
              </div>
            </div>
          )}

          <BottomNav />
          <CaptureFlow />
          <ToastContainer />
        </MobileShell>
      </CaptureProvider>
    </ToastProvider>
  );
}
