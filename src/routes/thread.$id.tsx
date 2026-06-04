import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { ThreadReply } from "@/components/ThreadReply";
import { POSTS, SAMPLE_THREAD } from "@/lib/mock-data";
import { ArrowBigUp, ArrowBigDown, Hash, MessageSquare, Share2, Bookmark, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/thread/$id")({
  component: ThreadPage,
});

function ThreadPage() {
  const { id } = Route.useParams();
  const post = POSTS.find((p) => p.id === id) ?? POSTS[0];

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </Link>

            {/* Pergunta — tier 0 */}
            <article className="mt-3 rounded-lg hairline bg-tier-question text-tier-question-foreground">
              <div className="flex">
                <div className="flex w-12 flex-col items-center gap-1 border-r border-border py-3 text-xs">
                  <button className="grid h-7 w-7 place-items-center rounded hover:bg-black/5 dark:hover:bg-white/10">
                    <ArrowBigUp className="h-4 w-4" />
                  </button>
                  <span className="font-semibold tabular-nums">{post.upvotes}</span>
                  <button className="grid h-7 w-7 place-items-center rounded hover:bg-black/5 dark:hover:bg-white/10">
                    <ArrowBigDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 text-[12px] opacity-80">
                    <span className="rounded-sm bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider dark:bg-white/10">
                      Pergunta
                    </span>
                    <span className="font-medium">g/{post.group}</span>
                    <span>·</span>
                    <span>u/{post.author}</span>
                    <span>·</span>
                    <span>{post.createdAt}</span>
                  </div>
                  <h1 className="mt-2 text-xl font-semibold leading-snug">{post.title}</h1>
                  <p className="mt-3 text-[14px] leading-relaxed">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full hairline bg-surface-1 px-2.5 py-0.5 text-[11px] font-medium">
                      <Hash className="h-3 w-3" /> {post.keyword}
                    </span>
                    <span className="text-[11px] opacity-70">Palavra-chave única do fórum</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs">
                    <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
                      <MessageSquare className="h-3.5 w-3.5" /> {post.replies} respostas
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
                      <Share2 className="h-3.5 w-3.5" /> Compartilhar
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
                      <Bookmark className="h-3.5 w-3.5" /> Salvar
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Composer */}
            <div className="mt-5 surface-card p-4">
              <p className="mb-2 text-[12px] font-medium text-muted-foreground">
                Responder à pergunta como <span className="text-foreground">u/voce</span>
              </p>
              <textarea
                rows={3}
                placeholder="Escreva uma resposta clara e fundamentada…"
                className="w-full resize-none rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-border-strong"
              />
              <div className="mt-2 flex justify-end">
                <button className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Publicar resposta
                </button>
              </div>
            </div>

            {/* Respostas escalonadas */}
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                {SAMPLE_THREAD.length} respostas
              </h2>
              {SAMPLE_THREAD.map((r) => (
                <ThreadReply key={r.id} reply={r} depth={0} />
              ))}
            </section>
          </div>
        </main>
        <TrendingPanel />
      </div>
    </div>
  );
}
