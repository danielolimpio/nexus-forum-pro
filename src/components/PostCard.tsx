import { Link } from "@tanstack/react-router";
import { MessageSquare, Share2, Bookmark, Hash } from "lucide-react";
import type { PostRow } from "@/lib/forum";
import { timeAgo } from "@/lib/forum";

export function PostCard({ post }: { post: PostRow }) {
  return (
    <article className="surface-card overflow-hidden transition hover:border-border-strong">
      <div className="flex">
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">g/{post.group?.slug ?? "geral"}</span>
            <span>·</span>
            <span>postado por u/{post.author?.username ?? "anon"}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          <Link
            to="/thread/$id"
            params={{ id: post.id }}
            className="mt-2 block text-[17px] font-semibold leading-snug text-foreground hover:text-primary"
          >
            {post.title}
          </Link>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.body}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full hairline bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Hash className="h-3 w-3" /> {post.keyword}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Link
              to="/thread/$id"
              params={{ id: post.id }}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-surface-2"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Discutir
            </Link>
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
