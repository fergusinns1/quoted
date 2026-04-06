"use client";

import { CaptureProvider } from "@/context/CaptureContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import MobileShell from "./MobileShell";
import BottomNav from "@/components/nav/BottomNav";
import CaptureFlow from "@/components/capture/CaptureFlow";
import ToastContainer from "@/components/ui/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <CaptureProvider>
          <MobileShell>
            {children}
            <BottomNav />
            <CaptureFlow />
            <ToastContainer />
          </MobileShell>
        </CaptureProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
