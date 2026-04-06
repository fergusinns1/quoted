"use client";

import { useState, useEffect, useRef } from "react";
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
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AvatarCropModal from "@/components/ui/AvatarCropModal";

const AVATAR_BUCKET = "avatars";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Local state ─────────────────────────────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Initialise from current user ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setNameValue(user.user_metadata?.full_name ?? "");
    setEmailValue(user.email ?? "");

    // Fetch signed avatar URL if a path is stored in metadata
    const avatarPath: string | undefined = user.user_metadata?.avatar_path;
    if (avatarPath) {
      supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(avatarPath, 60 * 60)
        .then(({ data }) => {
          if (data?.signedUrl) setAvatarUrl(data.signedUrl);
        });
    }
  }, [user]);

  // ── Avatar — open crop modal on file pick ───────────────────────────────────
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropFile(file);
  };

  // ── Avatar — upload cropped blob after user confirms crop ────────────────────
  const handleCropConfirm = async (blob: Blob) => {
    setCropFile(null);
    if (!user) return;
    setAvatarUploading(true);
    try {
      const path = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;

      const { error: metaError } = await supabase.auth.updateUser({
        data: { avatar_path: path },
      });
      if (metaError) throw metaError;

      const { data } = await supabase.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(path, 60 * 60);
      if (data?.signedUrl) setAvatarUrl(data.signedUrl);

      showToast("Profile photo updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Name save ────────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) return;
    setNameSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
      if (error) throw error;
      showToast("Name updated");
      setEditingName(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save name", "error");
    } finally {
      setNameSaving(false);
    }
  };

  // ── Email save ───────────────────────────────────────────────────────────────
  const handleSaveEmail = async () => {
    const trimmed = emailValue.trim();
    if (!trimmed || trimmed === user?.email) {
      setEditingEmail(false);
      return;
    }
    setEmailSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: trimmed });
      if (error) throw error;
      showToast("Confirmation sent to new email address", "info");
      setEditingEmail(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update email", "error");
    } finally {
      setEmailSaving(false);
    }
  };

  // ── Sign out ─────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/signin");
  };

  // ── Delete account ───────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    await signOut();
    showToast("Account deletion requested. Contact support to complete.", "info");
    router.replace("/auth/signin");
  };

  const currentName = user?.user_metadata?.full_name || "";
  const currentEmail = user?.email ?? "—";

  return (
    <div className="absolute inset-0 bg-white dark:bg-neutral-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-4 shrink-0">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={2} className="text-neutral-600 dark:text-neutral-300" />
        </button>
        <h1 className="text-neutral-900 dark:text-white text-[22px] font-bold tracking-tight">
          Profile
        </h1>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto shell-scroll min-h-0 pb-10">

        {/* Avatar */}
        <div className="flex flex-col items-center pt-4 pb-8 px-5">
          <div className="relative mb-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Change profile picture"
              className="w-20 h-20 rounded-full bg-neutral-200 overflow-hidden block active:opacity-80 transition-opacity"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={28} className="text-neutral-400" strokeWidth={1.5} />
                </div>
              )}
            </button>
            <div
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shadow-sm pointer-events-none"
            >
              {avatarUploading ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Camera size={13} className="text-white" strokeWidth={2} />
              )}
            </div>
          </div>
          <p className="text-neutral-400 dark:text-neutral-500 text-[13px]">Tap to change photo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFile}
          />
        </div>

        {/* Account section */}
        <Section label="Account">
          {/* Name row */}
          {editingName ? (
            <InlineEdit
              value={nameValue}
              onChange={setNameValue}
              placeholder="Your name"
              onSave={handleSaveName}
              onCancel={() => { setNameValue(currentName); setEditingName(false); }}
              saving={nameSaving}
            />
          ) : (
            <SettingsRow
              icon={<User size={16} className="text-neutral-500" />}
              label="Name"
              value={currentName || "Not set"}
              onTap={() => setEditingName(true)}
            />
          )}

          {/* Email row */}
          {editingEmail ? (
            <InlineEdit
              value={emailValue}
              onChange={setEmailValue}
              placeholder="your@email.com"
              onSave={handleSaveEmail}
              onCancel={() => { setEmailValue(currentEmail); setEditingEmail(false); }}
              saving={emailSaving}
              inputMode="email"
            />
          ) : (
            <SettingsRow
              icon={<Mail size={16} className="text-neutral-500" />}
              label="Email"
              value={currentEmail}
              onTap={() => setEditingEmail(true)}
              last
            />
          )}
        </Section>

        {/* Appearance — placeholder toggle */}
        <Section label="Appearance">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <Moon size={16} className="text-neutral-500 dark:text-neutral-400" />
              </div>
              <span className="text-neutral-800 dark:text-neutral-100 text-[15px]">Dark mode</span>
            </div>
            <button
              role="switch"
              aria-checked={theme === "dark"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                theme === "dark" ? "bg-neutral-900" : "bg-neutral-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Section>

        {/* Account actions */}
        <Section label="Account actions">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-neutral-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
              <LogOut size={16} className="text-neutral-500" />
            </div>
            <span className="text-neutral-800 dark:text-neutral-100 text-[15px] flex-1 text-left">Sign out</span>
          </button>

          <div className="h-px bg-neutral-100 mx-4" />

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-red-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 size={16} className="text-red-500" />
            </div>
            <span className="text-red-500 text-[15px] flex-1 text-left font-medium">Delete account</span>
          </button>
        </Section>

        <p className="text-center text-neutral-300 dark:text-neutral-700 text-[11px] pb-4">
          Quotd · {new Date().getFullYear()}
        </p>
      </div>

      {cropFile && (
        <AvatarCropModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropFile(null)}
        />
      )}

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

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 px-5">
      <p className="text-neutral-400 dark:text-neutral-500 text-[11px] font-semibold uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
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
  last: _last = false,
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
      className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <span className="text-neutral-800 dark:text-neutral-100 text-[15px] flex-1">{label}</span>
      {value && (
        <span className="text-neutral-400 dark:text-neutral-500 text-[13px] truncate max-w-[130px]">{value}</span>
      )}
      <ChevronRight size={14} className="text-neutral-300 dark:text-neutral-600 shrink-0" />
    </button>
  );
}

function InlineEdit({
  value,
  onChange,
  placeholder,
  onSave,
  onCancel,
  saving,
  inputMode = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        placeholder={placeholder}
        inputMode={inputMode}
        disabled={saving}
        className="flex-1 bg-transparent text-neutral-800 dark:text-neutral-100 text-[15px] placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none"
      />
      <button
        onClick={onCancel}
        disabled={saving}
        className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0"
      >
        <X size={13} className="text-neutral-500 dark:text-neutral-300" />
      </button>
      <button
        onClick={onSave}
        disabled={saving || !value.trim()}
        className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0 disabled:opacity-30"
      >
        {saving ? (
          <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <Check size={13} className="text-white dark:text-neutral-900" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
