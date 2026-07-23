import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { fetchArticles, timeAgo } from "@/lib/forum";
import { useAuth } from "@/lib/auth";
import { CreateArticleDialog } from "@/components/CreateArticleDialog";
import { PenSquare } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — GroupeForum.pro" },
      { name: "description", content: "Artigos e análises da comunidade GroupeForum.pro." },
      { property: "og:title", content: "Blog — GroupeForum.pro" },
      { property: "og:description", content: "Artigos e análises da comunidade GroupeForum.pro." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => fetchArticles(30),
  });

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <header className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-tight">Blog</h1>
              <button
                onClick={() => (user ? setOpen(true) : navigate({ to: "/auth" }))}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <PenSquare className="h-3.5 w-3.5" /> Escrever artigo
              </button>
            </header>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : articles.length === 0 ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                Ainda não há artigos publicados. Seja o primeiro.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {articles.map((a) => (
                  <Link
                    key={a.id}
                    to="/blog/$slug"
                    params={{ slug: a.slug }}
                    className="surface-card block overflow-hidden transition hover:border-border-strong"
                  >
                    {a.cover_url && (
                      <img src={a.cover_url} alt="" className="h-48 w-full object-cover" />
                    )}
                    <div className="p-5">
                      <div className="text-[12px] text-muted-foreground">
                        u/{a.author?.username ?? "anon"} · {timeAgo(a.created_at)}
                      </div>
                      <h2 className="mt-1 text-[17px] font-semibold leading-snug">{a.title}</h2>
                      {a.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {a.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
        <TrendingPanel />
      </div>
      <CreateArticleDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
