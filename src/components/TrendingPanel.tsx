import { Flame, TrendingUp, Hash } from "lucide-react";
import { TRENDING_KEYWORDS, GROUPS } from "@/lib/mock-data";

export function TrendingPanel() {
  return (
    <aside className="hidden xl:flex w-80 shrink-0 flex-col gap-4 py-6 pr-6">
      <section className="surface-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">Em alta</h3>
        </header>
        <ul className="flex flex-col">
          {TRENDING_KEYWORDS.slice(0, 6).map((kw, i) => (
            <li
              key={kw}
              className="group flex items-center gap-3 border-t border-border py-2 first:border-t-0"
            >
              <span className="w-5 text-xs font-semibold tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[13px] text-foreground group-hover:text-primary">
                {kw}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Grupos em destaque</h3>
        </header>
        <ul className="flex flex-col">
          {GROUPS.slice(0, 5).map((g) => (
            <li
              key={g.slug}
              className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">g/{g.slug}</p>
                <p className="text-[11px] text-muted-foreground">
                  {g.members.toLocaleString("pt-BR")} membros · {g.visibility === "public" ? "Público" : "Privado"}
                </p>
              </div>
              <button className="rounded-md hairline px-2.5 py-1 text-[11px] font-medium hover:bg-surface-2">
                Entrar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
        GroupeForum.pro — fórum profissional, focado em texto. As perguntas viram palavras-chave únicas do fórum.
      </p>
    </aside>
  );
}
