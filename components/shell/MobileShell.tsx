"use client";

/**
 * MobileShell
 * Centers a fixed iPhone-sized frame on the desktop.
 * All pages render inside this container.
 * Width: 390px  Height: 844px  (iPhone 14 logical resolution)
 */
export default function MobileShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* Desktop canvas — warm light background behind the phone */
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e8e6e1] py-8">
      {/* Phone frame */}
      <div
        className="relative overflow-hidden rounded-[44px] bg-white shadow-[0_32px_64px_rgba(0,0,0,0.18),0_8px_16px_rgba(0,0,0,0.10)]"
        style={{ width: 390, height: 844 }}
      >
        {/* Subtle bezel ring */}
        <div className="absolute inset-0 rounded-[44px] ring-1 ring-black/8 pointer-events-none z-50" />
        {children}
      </div>
    </div>
  );
}
