import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { fetchArticleBySlug, timeAgo } from "@/lib/forum";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params, loaderData }) => {
    const a = loaderData as { article?: { title: string; excerpt: string | null; cover_url: string | null } } | undefined;
    const title = a?.article?.title ? `${a.article.title} — Blog GroupeForum.pro` : `Artigo — Blog GroupeForum.pro`;
    const desc = a?.article?.excerpt ?? `Artigo ${params.slug} no Blog do GroupeForum.pro`;
    const meta: Array<{ title?: string; name?: string; property?: string; content?: string }> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (a?.article?.cover_url) {
      meta.push({ property: "og:image", content: a.article.cover_url });
      meta.push({ name: "twitter:image", content: a.article.cover_url });
    }
    return { meta };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <TopBar />
      <main className="px-4 py-10 text-center text-sm text-muted-foreground">Artigo não encontrado.</main>
    </div>
  ),
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticleBySlug(slug),
  });
  if (!isLoading && !article) throw notFound();

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Blog
            </Link>
            {isLoading || !article ? (
              <p className="mt-6 text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <article className="mt-3 surface-card overflow-hidden">
                {article.cover_url && (
                  <img src={article.cover_url} alt="" className="max-h-96 w-full object-cover" />
                )}
                <div className="p-6">
                  <div className="text-[12px] text-muted-foreground">
                    u/{article.author?.username ?? "anon"} · {timeAgo(article.created_at)}
                  </div>
                  <h1 className="mt-1 text-2xl font-semibold leading-tight">{article.title}</h1>
                  {article.excerpt && (
                    <p className="mt-3 text-[15px] italic text-muted-foreground">{article.excerpt}</p>
                  )}
                  <div className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                    {article.body}
                  </div>
                </div>
              </article>
            )}
          </div>
        </main>
        <TrendingPanel />
      </div>
    </div>
  );
}
