import { Link, useRouterState } from "@tanstack/react-router";
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
  Megaphone,
  Sparkles,
  PencilRuler,
  Wrench,
} from "lucide-react";
import { CATEGORIES, GROUPS } from "@/lib/mock-data";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/popular", label: "Popular", icon: TrendingUp },
  { to: "/explorar", label: "Explorar", icon: Compass },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
];

const CATEGORY_ICON: Record<string, typeof Home> = {
  tecnologia: Cpu,
  negocios: Briefcase,
  ciencia: FlaskConical,
  educacao: GraduationCap,
  saude: HeartPulse,
  direito: Scale,
  cultura: Landmark,
  criativo: PencilRuler,
  engenharia: Wrench,
  marketing: Megaphone,
  produtividade: Sparkles,
  lifestyle: Sparkles,
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-1 border-r border-border bg-surface-1/60 backdrop-blur-sm">
      <nav className="px-3 pt-4 pb-2">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
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
        <button className="flex w-full items-center gap-2 rounded-md hairline bg-surface-1 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-2">
          <Plus className="h-4 w-4 text-primary" />
          Criar grupo
        </button>
      </div>

      <div className="mt-4 px-3 pb-2">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Categorias
        </p>
        <div className="flex flex-col">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICON[c.slug] ?? Shield;
            return (
              <Link
                key={c.slug}
                to="/"
                className="flex items-center gap-3 rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-3 my-2 h-px bg-border" />

      <div className="px-3 pb-6">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Seus grupos
        </p>
        <div className="flex flex-col">
          {GROUPS.slice(0, 5).map((g) => (
            <Link
              key={g.slug}
              to="/"
              className="flex items-center gap-3 rounded-md px-3 py-1.5 text-[13px] text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="truncate">g/{g.slug}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-border px-3 py-3">
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
  );
}
