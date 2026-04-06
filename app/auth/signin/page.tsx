"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.replace("/");
    }
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-2 shrink-0">
        <h1 className="text-neutral-900 text-[32px] font-bold tracking-tight leading-tight">
          Welcome back.
        </h1>
        <p className="text-neutral-400 text-[15px] mt-1">Sign in to your account.</p>
      </div>

      {/* Spacer — pushes form to bottom so keyboard lifts it */}
      <div className="flex-1" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 pb-10 shrink-0 flex flex-col gap-3">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-red-600 text-[13px]">{error}</p>
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoComplete="email"
          className="w-full rounded-2xl bg-neutral-100 border-0 text-neutral-800 text-[16px] placeholder-neutral-400 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete="current-password"
          className="w-full rounded-2xl bg-neutral-100 border-0 text-neutral-800 text-[16px] placeholder-neutral-400 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] disabled:opacity-30 active:scale-[0.98] transition-transform"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-neutral-400 text-[13px] pt-1">
          No account?{" "}
          <Link href="/auth/signup" className="text-neutral-700 font-semibold">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
