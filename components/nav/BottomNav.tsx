"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Home } from "lucide-react";
import { useCaptureFlow } from "@/context/CaptureContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { isOpen, openCapture } = useCaptureFlow();

  // FAB lives directly on the quotes page; home handles its own nav
  if (isOpen || pathname) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-6 pointer-events-none">
      <div className="flex items-center gap-2 rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] px-3 py-2.5 pointer-events-auto">
        <Link
          href="/"
          aria-label="Home"
          className="w-9 h-9 flex items-center justify-center"
        >
          <Home size={18} strokeWidth={1.8} className="text-neutral-400" />
        </Link>

        <button
          onClick={openCapture}
          aria-label="Add new quote"
          className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={17} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}
