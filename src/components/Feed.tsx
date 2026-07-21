import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Flame, Clock, TrendingUp, Filter } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { PostCard } from "@/components/PostCard";
import { fetchPosts, type FeedSort } from "@/lib/forum";

type Tab = { to: string; label: string; icon: typeof Flame; sort: FeedSort };

const TABS: Tab[] = [
  { to: "/popular", label: "Em alta", icon: Flame, sort: "hot" },
  { to: "/recentes", label: "Recentes", icon: Clock, sort: "recent" },
  { to: "/top", label: "Top", icon: TrendingUp, sort: "top" },
];

export function Feed({
  title,
  sort,
  categories,
  showTabs = true,
  emptyText,
}: {
  title: string;
  sort: FeedSort;
  categories?: string[];
  showTabs?: boolean;
  emptyText?: string;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", sort, categories ?? "all"],
    queryFn: () => fetchPosts(30, sort, categories),
  });

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <header className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              {showTabs && (
                <div className="flex items-center gap-1 rounded-md hairline bg-surface-1 p-1 text-xs">
                  {TABS.map(({ to, label, icon: Icon }) => {
                    const active = pathname === to || (to === "/popular" && pathname === "/");
                    return (
                      <Link
                        key={to}
                        to={to}
                        className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition ${
                          active
                            ? "bg-surface-2 text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </Link>
                    );
                  })}
                  <button
                    aria-label="Filtrar discussões"
                    className="ml-1 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-muted-foreground hover:text-foreground"
                  >
                    <Filter className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </header>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : posts.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <h3 className="text-base font-semibold">Nada por aqui ainda</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {emptyText ?? "Seja o primeiro a abrir uma discussão."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
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
