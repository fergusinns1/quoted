import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "Quotd",
  description: "Capture quotes from the world around you",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: "100dvh", overflow: "hidden" }}>
      <body style={{ height: "100%", overflow: "hidden" }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
