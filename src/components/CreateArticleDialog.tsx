import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateUniqueArticleSlug } from "@/lib/forum";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { X, ImagePlus } from "lucide-react";

const COVER_MAX = 500 * 1024;

export function CreateArticleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const onPickCover = async (file: File) => {
    if (!user) return;
    if (file.size > COVER_MAX) return toast.error("Capa acima de 500KB");
    setUploading(true);
    try {
      const url = await uploadImage("covers", user.id, file);
      setCoverUrl(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar capa");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Faça login para publicar");
    if (title.trim().length < 6) return toast.error("Título muito curto");
    if (body.trim().length < 40) return toast.error("Corpo muito curto");
    setBusy(true);
    try {
      const slug = await generateUniqueArticleSlug(title);
      const { error } = await supabase.from("articles").insert({
        author_id: user.id,
        title,
        slug,
        excerpt: excerpt || null,
        body,
        cover_url: coverUrl,
      });
      if (error) throw error;
      toast.success("Artigo publicado");
      qc.invalidateQueries({ queryKey: ["articles"] });
      onClose();
      setTitle(""); setExcerpt(""); setBody(""); setCoverUrl(null);
      navigate({ to: "/blog/$slug", params: { slug } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl surface-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Novo artigo</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            required maxLength={140}
            placeholder="Título do artigo"
            value={title} onChange={(e) => setTitle(e.target.value)}
            className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <input
            maxLength={220}
            placeholder="Resumo curto (opcional)"
            value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md hairline bg-surface-2 px-3 py-2 text-xs hover:bg-surface-1">
              <ImagePlus className="h-3.5 w-3.5" />
              {coverUrl ? "Trocar capa" : "Adicionar capa (opcional · máx 500KB)"}
              <input
                type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && onPickCover(e.target.files[0])}
              />
            </label>
            {uploading && <span className="ml-2 text-[11px] text-muted-foreground">Enviando…</span>}
            {coverUrl && <img src={coverUrl} alt="" className="mt-2 h-32 w-full rounded-md object-cover" />}
          </div>
          <textarea
            required rows={12}
            placeholder="Conteúdo do artigo…"
            value={body} onChange={(e) => setBody(e.target.value)}
            className="resize-none rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md hairline px-3 py-1.5 text-sm hover:bg-surface-2">
              Cancelar
            </button>
            <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {busy ? "Publicando…" : "Publicar artigo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
