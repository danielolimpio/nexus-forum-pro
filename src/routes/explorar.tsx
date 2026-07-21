import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { fetchGroups } from "@/lib/forum";
import { CATEGORIES } from "@/lib/categories";
import { Users } from "lucide-react";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar — GroupeForum.pro" },
      { name: "description", content: "Explore todos os grupos e categorias do fórum." },
    ],
  }),
  component: Explorar,
});

function Explorar() {
  const { data: groups = [], isLoading } = useQuery({ queryKey: ["groups"], queryFn: fetchGroups });
  const byCat = new Map<string, typeof groups>();
  groups.forEach((g) => {
    const arr = byCat.get(g.category) ?? [];
    arr.push(g);
    byCat.set(g.category, arr);
  });
  const cats = CATEGORIES.filter((c) => byCat.has(c.value));

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-lg font-semibold tracking-tight">Explorar grupos</h1>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : cats.length === 0 ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                Nenhum grupo criado ainda.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {cats.map((c) => (
                  <section key={c.value} className="surface-card p-4">
                    <h2 className="mb-3 text-sm font-semibold tracking-tight">{c.label}</h2>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {byCat.get(c.value)!.map((g) => (
                        <Link
                          key={g.id}
                          to="/"
                          className="flex items-center gap-3 rounded-md hairline bg-surface-1 px-3 py-2 text-sm hover:bg-surface-2"
                        >
                          {g.image_url ? (
                            <img src={g.image_url} alt="" className="h-6 w-6 rounded-sm object-cover" />
                          ) : (
                            <Users className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-medium">g/{g.slug}</div>
                            <div className="truncate text-[11px] text-muted-foreground">{g.name}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </main>
        <TrendingPanel />
      </div>
    </div>
  );
}
