import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { Pencil, Award, MessageSquare, Hash, Camera, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  uploadImage,
  validateImage,
  MAX_AVATAR_BYTES,
  MAX_COVER_BYTES,
  formatBytes,
} from "@/lib/storage";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — GroupeForum.pro" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [stats, setStats] = useState({ posts: 0, keywords: 0 });
  const [uploading, setUploading] = useState<null | "avatar" | "cover">(null);
  const [showLimits, setShowLimits] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? "");
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setWebsite(profile.website ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("posts")
      .select("id, keyword", { count: "exact" })
      .eq("author_id", user.id)
      .then(({ data }) => {
        setStats({
          posts: data?.length ?? 0,
          keywords: new Set((data ?? []).map((r: { keyword: string }) => r.keyword)).size,
        });
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    const cleanUsername = username
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 24);
    if (cleanUsername.length < 3) return toast.error("Nome de usuário muito curto");
    let cleanWebsite = website.trim();
    if (cleanWebsite && !/^https?:\/\//i.test(cleanWebsite)) cleanWebsite = `https://${cleanWebsite}`;
    const { error } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        display_name: displayName,
        bio,
        website: cleanWebsite || null,
      })
      .eq("id", user.id);
    if (error) {
      if (error.message.includes("duplicate")) return toast.error("Nome de usuário já em uso");
      return toast.error(error.message);
    }
    toast.success("Perfil atualizado");
    setEditing(false);
    refreshProfile();
  };

  const handleUpload = async (kind: "avatar" | "cover", file: File) => {
    if (!user) return;
    const max = kind === "avatar" ? MAX_AVATAR_BYTES : MAX_COVER_BYTES;
    const err = validateImage(file, max);
    if (err) {
      setShowLimits(false);
      return toast.error(err);
    }
    setUploading(kind);
    try {
      const bucket = kind === "avatar" ? "avatars" : "covers";
      const url = await uploadImage(bucket, user.id, file);
      const patch = kind === "avatar" ? { avatar_url: url } : { cover_url: url };
      const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
      if (error) throw error;
      toast.success(kind === "avatar" ? "Foto atualizada" : "Banner atualizado");
      refreshProfile();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setUploading(null);
      setShowLimits(false);
    }
  };

  const initials = (profile?.display_name || profile?.username || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <section className="surface-card overflow-hidden">
              <div className="relative">
                <div
                  className="h-44 bg-gradient-to-br from-primary/80 via-primary to-accent bg-cover bg-center"
                  style={profile?.cover_url ? { backgroundImage: `url(${profile.cover_url})` } : undefined}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowLimits(true);
                    coverInput.current?.click();
                  }}
                  className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur hover:bg-black/70"
                  disabled={uploading === "cover"}
                >
                  <Camera className="h-3 w-3" />
                  {uploading === "cover" ? "Enviando…" : "Trocar banner"}
                </button>
                <input
                  ref={coverInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload("cover", f);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="flex items-end gap-4 px-6 pb-5 -mt-12 relative z-10">
                <div className="relative">
                  <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-surface-1 bg-gradient-to-br from-accent to-primary text-xl font-semibold text-primary-foreground overflow-hidden shadow-lg">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLimits(true);
                      avatarInput.current?.click();
                    }}
                    disabled={uploading === "avatar"}
                    className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-surface-1 bg-primary text-primary-foreground shadow hover:opacity-90"
                    title="Trocar foto"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload("avatar", f);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="flex-1 pt-16">
                  <h1 className="text-xl font-semibold leading-tight">
                    {profile?.display_name || profile?.username || "..."}
                  </h1>
                  <p className="text-xs font-normal text-muted-foreground">u/{profile?.username ?? "..."}</p>
                  {profile?.website && !editing && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Globe className="h-3 w-3" />
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setEditing((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md hairline bg-surface-1 px-3 py-1.5 text-sm hover:bg-surface-2 self-end"
                >
                  <Pencil className="h-3.5 w-3.5" /> {editing ? "Cancelar" : "Editar perfil"}
                </button>
              </div>

              {(showLimits || uploading) && (
                <p className="px-6 pb-3 text-[11px] text-muted-foreground">
                  Foto máx {formatBytes(MAX_AVATAR_BYTES)} · Banner máx {formatBytes(MAX_COVER_BYTES)}
                </p>
              )}

              <div className="grid grid-cols-3 border-t border-border">
                {[
                  { icon: Award, label: "Reputação", value: "—" },
                  { icon: MessageSquare, label: "Perguntas", value: String(stats.posts) },
                  { icon: Hash, label: "Palavras-chave", value: String(stats.keywords) },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 border-r border-border px-5 py-4 last:border-r-0"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-md hairline bg-surface-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold tabular-nums">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 surface-card p-5">
              <h2 className="mb-2 text-sm font-semibold">Sobre</h2>
              {editing ? (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-muted-foreground">Nome de exibição</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nome de exibição"
                    className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
                  />
                  <label className="text-[11px] font-medium text-muted-foreground">Nome de usuário</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usuario"
                    className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
                  />
                  <label className="text-[11px] font-medium text-muted-foreground">Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte sobre você"
                    className="resize-none rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
                  />
                  <label className="text-[11px] font-medium text-muted-foreground">Site / link</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://seusite.com"
                    className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={save}
                      className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                  {profile?.bio ? linkify(profile.bio) : "Adicione uma descrição ao seu perfil."}
                </p>
              )}
            </section>
          </div>
        </main>
        <TrendingPanel />
      </div>
    </div>
  );
}
