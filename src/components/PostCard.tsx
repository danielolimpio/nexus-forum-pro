import { Link } from "@tanstack/react-router";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, Hash } from "lucide-react";
import type { Post } from "@/lib/mock-data";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="surface-card overflow-hidden transition hover:border-border-strong">
      <div className="flex">
        <div className="flex w-12 flex-col items-center gap-1 border-r border-border bg-surface-2/60 py-3 text-xs text-muted-foreground">
          <button className="grid h-7 w-7 place-items-center rounded hover:bg-surface-3 hover:text-primary">
            <ArrowBigUp className="h-4 w-4" />
          </button>
          <span className="font-semibold text-foreground tabular-nums">{post.upvotes}</span>
          <button className="grid h-7 w-7 place-items-center rounded hover:bg-surface-3 hover:text-destructive">
            <ArrowBigDown className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">g/{post.group}</span>
            <span>·</span>
            <span>postado por u/{post.author}</span>
            <span>·</span>
            <span>{post.createdAt}</span>
          </div>

          <Link
            to="/thread/$id"
            params={{ id: post.id }}
            className="mt-2 block text-[17px] font-semibold leading-snug text-foreground hover:text-primary"
          >
            {post.title}
          </Link>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full hairline bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Hash className="h-3 w-3" /> {post.keyword}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-surface-2">
              <MessageSquare className="h-3.5 w-3.5" /> {post.replies} respostas
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-surface-2">
              <Share2 className="h-3.5 w-3.5" /> Compartilhar
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-surface-2">
              <Bookmark className="h-3.5 w-3.5" /> Salvar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
