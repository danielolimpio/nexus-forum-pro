import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { Pencil, Award, MessageSquare, Hash } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — GroupeForum.pro" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [stats, setStats] = useState({ posts: 0, keywords: 0 });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
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
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    setEditing(false);
    refreshProfile();
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
              <div
                className="relative h-44 bg-gradient-to-br from-primary/80 via-primary to-accent"
                style={profile?.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: "cover" } : undefined}
              />

              <div className="flex items-end gap-4 px-6 pb-5 -mt-10">
                <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-surface-1 bg-gradient-to-br from-accent to-primary text-xl font-semibold text-primary-foreground overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <h1 className="text-lg font-semibold">u/{profile?.username ?? "..."}</h1>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-md hairline bg-surface-1 px-3 py-1.5 text-sm hover:bg-surface-2"
                >
                  <Pencil className="h-3.5 w-3.5" /> {editing ? "Cancelar" : "Editar perfil"}
                </button>
              </div>

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
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nome de exibição"
                    className="rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte sobre você"
                    className="resize-none rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none"
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
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {profile?.bio || "Adicione uma descrição ao seu perfil."}
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
