"use client";

import { CaptureProvider } from "@/context/CaptureContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import MobileShell from "./MobileShell";
import BottomNav from "@/components/nav/BottomNav";
import CaptureFlow from "@/components/capture/CaptureFlow";
import ToastContainer from "@/components/ui/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
