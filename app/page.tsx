"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, User } from "lucide-react";
import { useCaptureFlow } from "@/context/CaptureContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { openCapture } = useCaptureFlow();
  const { user, loading, avatarUrl, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/signin");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="absolute inset-0 bg-neutral-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-500 animate-spin" />
      </div>
    );
  }

  const firstName = (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/signin");
  };

  return (
    <div className="absolute inset-0 bg-neutral-50 flex flex-col items-center justify-center px-8">

      {/* Center section */}
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <h1 className="text-neutral-900 text-[32px] font-semibold tracking-tight">
          Hey, {firstName}!
        </h1>
        <p className="text-neutral-400 text-[16px]">Add a new quote:</p>
        <button
          onClick={openCapture}
          aria-label="Add new quote"
          className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center shadow-lg active:scale-95 transition-transform mt-2"
        >
          <Plus size={32} className="text-white" strokeWidth={1.75} />
        </button>
      </div>

      {/* Bottom section */}
      <div className="w-full pb-12 flex flex-col items-center gap-4">
        <Link
          href="/quotes"
          className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-4 active:opacity-80 transition-opacity shadow-sm"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={18} className="text-neutral-400" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <span className="text-neutral-900 font-medium text-[16px]">My Quotes</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="text-neutral-400 text-[14px] active:opacity-60 transition-opacity"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
