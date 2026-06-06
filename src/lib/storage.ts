import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const MAX_AVATAR_BYTES = 300 * 1024; // 300 KB
export const MAX_COVER_BYTES = 500 * 1024; // 500 KB
export const MAX_GROUP_BYTES = 2 * 1024 * 1024; // 2 MB

export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImage(file: File, max: number): string | null {
  if (!file.type.startsWith("image/")) return "Selecione um arquivo de imagem.";
  if (file.size > max) return `Imagem maior que ${formatBytes(max)}.`;
  return null;
}

/**
 * Uploads a file to a private bucket under `<userId>/<filename>` and returns a long-lived signed URL.
 */
export async function uploadImage(
  bucket: "avatars" | "covers" | "groups",
  userId: string,
  file: File,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (error || !data) throw error ?? new Error("Falha ao gerar URL");
  return data.signedUrl;
}
