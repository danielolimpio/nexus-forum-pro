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
import { useQuery } from "@tanstack/react-query";
import { fetchGroups } from "@/lib/forum";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { CreatePostDialog } from "./CreatePostDialog";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/", label: "Popular", icon: TrendingUp },
  { to: "/", label: "Explorar", icon: Compass },
  { to: "/", label: "Notícias", icon: Newspaper },
];

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
  const { data: groups = [] } = useQuery({ queryKey: ["groups"], queryFn: fetchGroups });
  const [createOpen, setCreateOpen] = useState(false);

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
        </div>

        <div className="mt-4 px-3 pb-2">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Grupos
          </p>
          <div className="flex flex-col">
            {groups.map((g) => {
              const Icon = CATEGORY_ICON[g.category] ?? Shield;
              return (
                <Link
                  key={g.id}
                  to="/"
                  className="flex items-center gap-3 rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">g/{g.slug}</span>
                </Link>
              );
            })}
          </div>
        </div>

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
    </>
  );
}
