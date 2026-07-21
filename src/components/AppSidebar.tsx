import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  TrendingUp,
  Compass,
  Newspaper,
  Plus,
  Users,
  Bookmark,
  Settings,
  Shield,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Scale,
  Landmark,
  FlaskConical,
  Cpu,
  Wrench,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGroups, fetchPendingDeletionGroups, softDeleteGroup } from "@/lib/forum";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { CreatePostDialog } from "./CreatePostDialog";
import { CreateGroupDialog } from "./CreateGroupDialog";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/popular", label: "Popular", icon: TrendingUp },
  { to: "/explorar", label: "Explorar", icon: Compass },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
] as const;

const CATEGORY_ICON: Record<string, typeof Home> = {
  tecnologia: Cpu,
  negocios: Briefcase,
  ciencia: FlaskConical,
  educacao: GraduationCap,
  saude: HeartPulse,
  direito: Scale,
  cultura: Landmark,
  engenharia: Wrench,
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: groups = [] } = useQuery({ queryKey: ["groups"], queryFn: fetchGroups });
  const { data: pending = [] } = useQuery({
    queryKey: ["groups", "pending", user?.id],
    queryFn: () => (user ? fetchPendingDeletionGroups(user.id) : Promise.resolve([])),
    enabled: !!user,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const onDelete = async (id: string, slug: string) => {
    if (!confirm(`Excluir g/${slug}? O grupo será removido permanentemente após 7 dias. A URL será liberada imediatamente para outros usuários.`)) return;
    try {
      await softDeleteGroup(id);
      toast.success("Grupo agendado para exclusão em 7 dias. URL liberada.");
      qc.invalidateQueries({ queryKey: ["groups"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  const daysLeft = (iso: string) =>
    Math.max(0, 7 - Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-1 border-r border-border bg-surface-1/60 backdrop-blur-sm">
        <nav className="px-3 pt-4 pb-2">
          {NAV.map(({ to, label, icon: Icon }, i) => {
            const active = i === 0 && pathname === to;
            return (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 my-2 h-px bg-border" />

        <div className="px-3">
          <button
            onClick={() => (user ? setCreateOpen(true) : navigate({ to: "/auth" }))}
            className="flex w-full items-center gap-2 rounded-md hairline bg-surface-1 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-2"
          >
            <Plus className="h-4 w-4 text-primary" />
            Nova pergunta
          </button>
          <button
            onClick={() => (user ? setGroupOpen(true) : navigate({ to: "/auth" }))}
            className="mt-2 flex w-full items-center gap-2 rounded-md hairline bg-surface-1 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-2"
          >
            <Users className="h-4 w-4 text-primary" />
            Criar grupo
          </button>
        </div>

        <div className="mt-4 px-3 pb-2">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Grupos
          </p>
          <div className="flex flex-col">
            {groups.map((g) => {
              const Icon = CATEGORY_ICON[g.category] ?? Shield;
              const mine = user && g.created_by === user.id;
              return (
                <div
                  key={g.id}
                  className="group flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
                >
                  <Link to="/" className="flex flex-1 items-center gap-3 min-w-0">
                    {g.image_url ? (
                      <img src={g.image_url} alt="" className="h-4 w-4 rounded-sm object-cover" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    <span className="truncate">g/{g.slug}</span>
                  </Link>
                  {mine && (
                    <button
                      onClick={() => onDelete(g.id, g.slug)}
                      className="opacity-0 group-hover:opacity-100 transition rounded p-1 hover:bg-destructive/20 hover:text-destructive"
                      title="Excluir grupo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {pending.length > 0 && (
          <div className="mt-2 px-3 pb-2">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Exclusão agendada
            </p>
            <div className="flex flex-col gap-1">
              {pending.map((g) => (
                <div
                  key={g.id}
                  className="rounded-md hairline bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
                >
                  <div className="font-medium truncate">g/{g.slug}</div>
                  <div className="text-[10px] opacity-80">
                    Será removido em {daysLeft(g.deleted_at!)} dia(s)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-border px-3 py-3">
          <Link
            to="/perfil"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <Users className="h-3.5 w-3.5" /> Perfil
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <Bookmark className="h-3.5 w-3.5" /> Salvos
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" /> Configurações
          </Link>
        </div>
      </aside>
      <CreatePostDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <CreateGroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />
    </>
  );
}
