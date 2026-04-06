"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Supabase sends a confirmation email — show a success state
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="absolute inset-0 bg-white flex flex-col items-center justify-center px-8 text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">
          ✉️
        </div>
        <div>
          <h2 className="text-neutral-900 text-[22px] font-bold mb-1">Check your email</h2>
          <p className="text-neutral-400 text-[14px] leading-relaxed">
            We sent a confirmation link to <span className="text-neutral-700 font-medium">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="mt-2 rounded-full px-6 py-3 bg-neutral-900 text-white font-semibold text-[14px]"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-16 pb-2 shrink-0">
        <h1 className="text-neutral-900 text-[32px] font-bold tracking-tight leading-tight">
          Create account.
        </h1>
        <p className="text-neutral-400 text-[15px] mt-1">Start capturing quotes.</p>
      </div>

      <div className="flex-1" />

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
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-2xl bg-neutral-100 border-0 text-neutral-800 text-[16px] placeholder-neutral-400 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />

        <button
          type="submit"
          disabled={loading || !email || password.length < 6}
          className="w-full rounded-full py-4 bg-neutral-900 text-white font-semibold text-[15px] disabled:opacity-30 active:scale-[0.98] transition-transform"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-neutral-400 text-[13px] pt-1">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-neutral-700 font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
