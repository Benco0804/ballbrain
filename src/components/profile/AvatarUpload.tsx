"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
}

export default function AvatarUpload({ userId, avatarUrl, displayName }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    // Bust browser cache by appending a timestamp
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      setError("Could not save avatar. Please try again.");
      setUploading(false);
      return;
    }

    setPreview(bustedUrl);
    setUploading(false);
  }

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 hover:border-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        title="Change avatar"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-300">
            {initials}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-semibold">
            {uploading ? "Uploading…" : "Change"}
          </span>
        </div>
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
