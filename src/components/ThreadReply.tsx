import { ArrowBigUp, ArrowBigDown, Reply as ReplyIcon } from "lucide-react";
import type { Reply } from "@/lib/mock-data";

const TIERS = [
  { bg: "bg-tier-answer", fg: "text-tier-answer-foreground", bar: "bg-[oklch(0.6_0.12_220)]", label: "Resposta" },
  { bg: "bg-tier-reply", fg: "text-tier-reply-foreground", bar: "bg-[oklch(0.55_0.13_160)]", label: "Réplica" },
  { bg: "bg-tier-thread", fg: "text-tier-thread-foreground", bar: "bg-[oklch(0.6_0.14_70)]", label: "Tréplica" },
];

export function ThreadReply({ reply, depth = 0 }: { reply: Reply; depth?: number }) {
  const tier = TIERS[Math.min(depth, TIERS.length - 1)];

  return (
    <div className={`flex gap-3 ${depth > 0 ? "ml-6 mt-3" : "mt-3"}`}>
      <div className={`w-[3px] shrink-0 rounded-full ${tier.bar}`} />
      <div className={`flex-1 rounded-lg hairline ${tier.bg} ${tier.fg} p-4`}>
        <div className="flex items-center gap-2 text-[11px] opacity-80">
          <span className="rounded-sm bg-black/5 px-1.5 py-0.5 font-medium uppercase tracking-wider dark:bg-white/10">
            {tier.label}
          </span>
          <span className="font-medium">u/{reply.author}</span>
          <span>·</span>
          <span>{reply.createdAt}</span>
        </div>

        <p className="mt-2 text-[14px] leading-relaxed">{reply.body}</p>

        <div className="mt-3 flex items-center gap-1 text-[12px] opacity-90">
          <button className="grid h-6 w-6 place-items-center rounded hover:bg-black/5 dark:hover:bg-white/10">
            <ArrowBigUp className="h-3.5 w-3.5" />
          </button>
          <span className="tabular-nums">{reply.upvotes}</span>
          <button className="grid h-6 w-6 place-items-center rounded hover:bg-black/5 dark:hover:bg-white/10">
            <ArrowBigDown className="h-3.5 w-3.5" />
          </button>
          <button className="ml-2 inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
            <ReplyIcon className="h-3 w-3" /> Responder
          </button>
        </div>

        {reply.children?.map((c) => (
          <ThreadReply key={c.id} reply={c} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}
