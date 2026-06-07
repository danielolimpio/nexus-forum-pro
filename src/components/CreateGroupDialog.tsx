import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { uploadImage, validateImage, MAX_GROUP_BYTES, formatBytes } from "@/lib/storage";
import { generateUniqueSlug } from "@/lib/forum";
import { CATEGORIES } from "@/lib/categories";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function CreateGroupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const sorted = useMemo(
    () => [...CATEGORIES].sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [],
  );
  const [category, setCategory] = useState(sorted[0]?.value ?? "");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const onPick = (f: File | null) => {
    if (!f) return;
    const err = validateImage(f, MAX_GROUP_BYTES);
    if (err) return toast.error(err);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Faça login");
    if (slugify(name).length < 3) return toast.error("Nome inválido");
    setBusy(true);
    try {
      const slug = await generateUniqueSlug(name);
      let image_url: string | null = null;
      if (file) image_url = await uploadImage("groups", user.id, file);
      const { error } = await supabase.from("groups").insert({
        name,
        slug,
        category,
        description,
        image_url,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success(`Grupo criado: g/${slug}`);
      qc.invalidateQueries({ queryKey: ["groups"] });
      onClose();
      setName(""); setDescription(""); setFile(null); setPreview(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar grupo";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-xl surface-card p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Criar grupo</h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <label className="grid h-16 w-16 cursor-pointer place-items-center overflow-hidden rounded-md hairline bg-surface-2 text-muted-foreground hover:bg-surface-1">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              />
            </label>
            <div className="text-[11px] text-muted-foreground">
              Foto do grupo (opcional)<br />Máx {formatBytes(MAX_GROUP_BYTES)}.
            </div>
          </div>
          <input
            required
            maxLength={40}
            placeholder="Nome do grupo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <p className="text-[11px] text-muted-foreground -mt-1">
            URL: g/{slugify(name) || "..."} · Criador: u/{profile?.username ?? "..."}
          </p>
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Categoria</p>
            <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto rounded-md hairline bg-surface-2 p-2 sm:grid-cols-3">
              {sorted.map((c) => {
                const Icon = c.icon;
                const active = category === c.value;
                return (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-surface-1 text-foreground"
                    }`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${active ? "bg-primary-foreground/15" : "bg-surface-1"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <textarea
            rows={3}
            maxLength={300}
            placeholder="Descrição do grupo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md hairline px-3 py-1.5 text-sm hover:bg-surface-2">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Criando…" : "Criar grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
