"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Moon,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const showToast = useToast();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // placeholder

  const email = user?.email ?? "—";
  const displayName = user?.user_metadata?.full_name ?? "";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/signin");
  };

  const handleDeleteAccount = async () => {
    // Calls the Supabase admin delete — requires server action in production.
    // Placeholder: sign out and show message.
    await signOut();
    showToast("Account deletion requested. Contact support to complete.", "info");
    router.replace("/auth/signin");
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-4 shrink-0">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600" />
        </button>
        <h1 className="text-neutral-900 text-[22px] font-bold tracking-tight">
          Profile
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto shell-scroll min-h-0 pb-10">

        {/* Avatar */}
        <div className="flex flex-col items-center pt-4 pb-8 px-5">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/HomeImage.png"
                alt="Profile"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <button
              aria-label="Change profile picture"
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shadow-sm"
            >
              <Camera size={13} className="text-white" strokeWidth={2} />
            </button>
          </div>
          <p className="text-neutral-400 text-[13px]">Tap to change photo</p>
        </div>

        {/* Account section */}
        <Section label="Account">
          <SettingsRow
            icon={<User size={16} className="text-neutral-500" />}
            label="Name"
            value={displayName || "Not set"}
            onTap={() => showToast("Name editing coming soon", "info")}
          />
          <SettingsRow
            icon={<Mail size={16} className="text-neutral-500" />}
            label="Email"
            value={email}
            onTap={() => showToast("Email editing coming soon", "info")}
            last
          />
        </Section>

        {/* Appearance section */}
        <Section label="Appearance">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                <Moon size={16} className="text-neutral-500" />
              </div>
              <span className="text-neutral-800 text-[15px]">Dark mode</span>
            </div>
            <button
              role="switch"
              aria-checked={darkMode}
              onClick={() => {
                setDarkMode((d) => !d);
                showToast("Dark mode coming soon", "info");
              }}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                darkMode ? "bg-neutral-900" : "bg-neutral-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </Section>

        {/* Danger section */}
        <Section label="Account actions">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
              <LogOut size={16} className="text-neutral-500" />
            </div>
            <span className="text-neutral-800 text-[15px] flex-1 text-left">
              Sign out
            </span>
          </button>

          <div className="h-px bg-neutral-100 mx-4" />

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-red-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 size={16} className="text-red-500" />
            </div>
            <span className="text-red-500 text-[15px] flex-1 text-left font-medium">
              Delete account
            </span>
          </button>
        </Section>

        <p className="text-center text-neutral-300 text-[11px] pt-2 pb-4">
          Quotd · {new Date().getFullYear()}
        </p>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete account?"
          message="This will permanently remove your account and all saved quotes. This cannot be undone."
          confirmLabel="Delete account"
          destructive
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 px-5">
      <p className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mb-2 px-0">
        {label}
      </p>
      <div className="rounded-2xl bg-neutral-50 overflow-hidden divide-y divide-neutral-100">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onTap,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onTap?: () => void;
  last?: boolean;
}) {
  return (
    <button
      onClick={onTap}
      className={`w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-100 transition-colors text-left ${
        last ? "" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-white border border-neutral-100 flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <span className="text-neutral-800 text-[15px] flex-1">{label}</span>
      {value && (
        <span className="text-neutral-400 text-[13px] truncate max-w-[120px]">
          {value}
        </span>
      )}
      <ChevronRight size={14} className="text-neutral-300 shrink-0" />
    </button>
  );
}
