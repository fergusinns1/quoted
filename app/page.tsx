"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCaptureFlow } from "@/context/CaptureContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { openCapture } = useCaptureFlow();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/signin");
  }, [loading, user, router]);

  // Show spinner while auth resolves or before redirect fires
  if (loading || !user) {
    return (
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-14 pb-2 shrink-0">
        <h1 className="text-neutral-900 text-[28px] font-bold tracking-tight leading-tight">
          Let&apos;s get Quoting.
        </h1>
        <Link
          href="/quotes"
          aria-label="My Quotes"
          className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-neutral-200 active:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/HomeImage.png"
            alt="Profile"
            className="w-full h-full object-cover object-top"
          />
        </Link>
      </div>

      {/* Oval image card — fills remaining space */}
      <div className="flex-1 flex items-center justify-center px-8 pb-10">
        <button
          onClick={openCapture}
          aria-label="Capture a quote"
          className="relative overflow-hidden w-full active:scale-[0.98] transition-transform"
          style={{
            maxWidth: 320,
            aspectRatio: "3 / 4.6",
            borderRadius: 160,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/HomeImage.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="bg-white text-neutral-900 font-semibold text-[15px] px-6 py-3 shadow-sm"
              style={{ borderRadius: 14 }}
            >
              Capture Quote
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
