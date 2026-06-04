import { Flame, TrendingUp, Hash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchGroups, fetchTrendingKeywords } from "@/lib/forum";

export function TrendingPanel() {
  const { data: keywords = [] } = useQuery({
    queryKey: ["trending-keywords"],
    queryFn: () => fetchTrendingKeywords(8),
  });
  const { data: groups = [] } = useQuery({ queryKey: ["groups"], queryFn: fetchGroups });

  return (
    <aside className="hidden xl:flex w-80 shrink-0 flex-col gap-4 py-6 pr-6">
      <section className="surface-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">Palavras-chave em alta</h3>
        </header>
        {keywords.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhuma pergunta ainda. Crie a primeira.</p>
        ) : (
          <ul className="flex flex-col">
            {keywords.map((kw, i) => (
              <li
                key={kw}
                className="group flex items-center gap-3 border-t border-border py-2 first:border-t-0"
              >
                <span className="w-5 text-xs font-semibold tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate text-[13px] text-foreground group-hover:text-primary">{kw}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface-card p-5">
        <header className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Grupos</h3>
        </header>
        <ul className="flex flex-col">
          {groups.slice(0, 8).map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">g/{g.slug}</p>
                <p className="truncate text-[11px] text-muted-foreground">{g.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
        GroupeForum.pro — fórum profissional focado em texto. Cada pergunta vira uma palavra-chave única que constrói autoridade ao fórum.
      </p>
    </aside>
  );
}
