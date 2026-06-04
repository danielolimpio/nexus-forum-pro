import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { PostCard } from "@/components/PostCard";
import { fetchPosts } from "@/lib/forum";
import { Flame, Clock, TrendingUp, Filter } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GroupeForum.pro — Fórum profissional de discussões" },
      {
        name: "description",
        content:
          "Fórum profissional focado em texto. Discussões estruturadas, grupos por categoria e palavras-chave únicas que constroem autoridade.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["posts"], queryFn: () => fetchPosts(30) });

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <header className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-tight">Discussões em destaque</h1>
              <div className="flex items-center gap-1 rounded-md hairline bg-surface-1 p-1 text-xs">
                <button className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-medium bg-surface-2 text-foreground">
                  <Flame className="h-3.5 w-3.5" /> Em alta
                </button>
                <button className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-muted-foreground hover:text-foreground">
                  <Clock className="h-3.5 w-3.5" /> Recentes
                </button>
                <button className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-muted-foreground hover:text-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Top
                </button>
                <button className="ml-1 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-muted-foreground hover:text-foreground">
                  <Filter className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : posts.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <h3 className="text-base font-semibold">Nenhuma pergunta ainda</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seja o primeiro a abrir uma discussão e registrar uma palavra-chave única no fórum.
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
