import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchGroups, normalizeKeyword } from "@/lib/forum";
import { toast } from "sonner";
import { X, Hash } from "lucide-react";

export function CreatePostDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: groups = [] } = useQuery({ queryKey: ["groups"], queryFn: fetchGroups });

  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywordEdited, setKeywordEdited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!keywordEdited) setKeyword(normalizeKeyword(title).split(" ").slice(0, 5).join(" "));
  }, [title, keywordEdited]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Faça login para postar");
    if (!groupId) return toast.error("Escolha um grupo");
    const kw = normalizeKeyword(keyword);
    if (kw.length < 4) return toast.error("Palavra-chave muito curta");

    setBusy(true);
    // Uniqueness check
    const { data: exists } = await supabase.from("posts").select("id").eq("keyword", kw).maybeSingle();
    if (exists) {
      setBusy(false);
      return toast.error("Essa palavra-chave já existe no fórum. Escolha outra.");
    }
    const { data, error } = await supabase
      .from("posts")
      .insert({ group_id: groupId, author_id: user.id, title, body, keyword: kw })
      .select("id")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Pergunta publicada");
    qc.invalidateQueries({ queryKey: ["posts"] });
    qc.invalidateQueries({ queryKey: ["trending-keywords"] });
    onClose();
    navigate({ to: "/thread/$id", params: { id: data!.id } });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl surface-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Nova pergunta</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
            className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          >
            <option value="">Selecione um grupo…</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                g/{g.slug} — {g.name}
              </option>
            ))}
          </select>
          <input
            required
            maxLength={180}
            placeholder="Pergunta (clara e objetiva)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <textarea
            required
            rows={6}
            placeholder="Contexto detalhado da pergunta…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="resize-none rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Hash className="h-3 w-3" /> Palavra-chave única (define autoridade no fórum)
            </label>
            <input
              required
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setKeywordEdited(true);
              }}
              className="w-full rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Será normalizada e precisa ser inédita no fórum.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md hairline px-3 py-1.5 text-sm hover:bg-surface-2">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Publicando…" : "Publicar pergunta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
