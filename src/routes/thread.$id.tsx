import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { ThreadReply } from "@/components/ThreadReply";
import { fetchPost, fetchReplies, timeAgo } from "@/lib/forum";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Hash, MessageSquare, Share2, Bookmark, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/thread/$id")({
  component: ThreadPage,
});

function ThreadPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: post, isLoading } = useQuery({ queryKey: ["post", id], queryFn: () => fetchPost(id) });
  const { data: replies = [] } = useQuery({ queryKey: ["replies", id], queryFn: () => fetchReplies(id) });

  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate({ to: "/auth" });
    if (!body.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("replies").insert({
      post_id: id,
      parent_id: null,
      author_id: user.id,
      body,
      depth: 0,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setBody("");
    qc.invalidateQueries({ queryKey: ["replies", id] });
  };

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

            {isLoading || !post ? (
              <p className="mt-6 text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <>
                <article className="mt-3 rounded-lg hairline bg-tier-question text-tier-question-foreground">
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[12px] opacity-80">
                      <span className="rounded-sm bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider dark:bg-white/10">
                        Pergunta
                      </span>
                      <span className="font-medium">g/{post.group?.slug}</span>
                      <span>·</span>
                      <span>u/{post.author?.username}</span>
                      <span>·</span>
                      <span>{timeAgo(post.created_at)}</span>
                    </div>
                    <h1 className="mt-2 text-xl font-semibold leading-snug">{post.title}</h1>
                    <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed">{post.body}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full hairline bg-surface-1 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                        <Hash className="h-3 w-3" /> {post.keyword}
                      </span>
                      <span className="text-[11px] opacity-70">Palavra-chave única do fórum</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1">
                        <MessageSquare className="h-3.5 w-3.5" /> {replies.length} respostas
                      </span>
                      <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
                        <Share2 className="h-3.5 w-3.5" /> Compartilhar
                      </button>
                      <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
                        <Bookmark className="h-3.5 w-3.5" /> Salvar
                      </button>
                    </div>
                  </div>
                </article>

                <form onSubmit={submit} className="mt-5 surface-card p-4">
                  <p className="mb-2 text-[12px] font-medium text-muted-foreground">
                    {user ? (
                      <>Responder à pergunta como <span className="text-foreground">u/você</span></>
                    ) : (
                      <Link to="/auth" className="text-primary hover:underline">
                        Entre para responder
                      </Link>
                    )}
                  </p>
                  <textarea
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    disabled={!user}
                    placeholder="Escreva uma resposta clara e fundamentada…"
                    className="w-full resize-none rounded-md hairline bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-border-strong disabled:opacity-60"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={busy || !user}
                      className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                    >
                      {busy ? "Publicando…" : "Publicar resposta"}
                    </button>
                  </div>
                </form>

                <section className="mt-6">
                  <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
                    {replies.length} respostas
                  </h2>
                  {replies.map((r) => (
                    <ThreadReply key={r.id} reply={r} depth={0} />
                  ))}
                </section>
              </>
            )}
          </div>
        </main>
        <TrendingPanel />
      </div>
    </div>
  );
}
