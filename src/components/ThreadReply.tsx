import { useState } from "react";
import { Reply as ReplyIcon } from "lucide-react";
import type { ReplyNode } from "@/lib/forum";
import { timeAgo } from "@/lib/forum";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const TIERS = [
  { bg: "bg-tier-answer", fg: "text-tier-answer-foreground", bar: "bg-[oklch(0.6_0.12_220)]", label: "Resposta" },
  { bg: "bg-tier-reply", fg: "text-tier-reply-foreground", bar: "bg-[oklch(0.55_0.13_160)]", label: "Réplica" },
  { bg: "bg-tier-thread", fg: "text-tier-thread-foreground", bar: "bg-[oklch(0.6_0.14_70)]", label: "Tréplica" },
];

export function ThreadReply({ reply, depth = 0 }: { reply: ReplyNode; depth?: number }) {
  const tier = TIERS[Math.min(depth, TIERS.length - 1)];
  const { user } = useAuth();
  const qc = useQueryClient();
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return toast.error("Faça login para responder");
    if (!body.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("replies").insert({
      post_id: reply.post_id,
      parent_id: reply.id,
      author_id: user.id,
      body,
      depth: Math.min(reply.depth + 1, 5),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setBody("");
    setReplying(false);
    qc.invalidateQueries({ queryKey: ["replies", reply.post_id] });
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? "ml-6 mt-3" : "mt-3"}`}>
      <div className={`w-[3px] shrink-0 rounded-full ${tier.bar}`} />
      <div className={`flex-1 rounded-lg hairline ${tier.bg} ${tier.fg} p-4`}>
        <div className="flex items-center gap-2 text-[11px] opacity-80">
          <span className="rounded-sm bg-black/5 px-1.5 py-0.5 font-medium uppercase tracking-wider dark:bg-white/10">
            {tier.label}
          </span>
          <span className="font-medium">u/{reply.author?.username ?? "anon"}</span>
          <span>·</span>
          <span>{timeAgo(reply.created_at)}</span>
        </div>

        <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed">{reply.body}</p>

        <div className="mt-3 flex items-center gap-1 text-[12px] opacity-90">
          <button
            onClick={() => setReplying((v) => !v)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ReplyIcon className="h-3 w-3" /> Responder
          </button>
        </div>

        {replying && (
          <div className="mt-3">
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escreva sua réplica…"
              className="w-full resize-none rounded-md hairline bg-surface-1 px-3 py-2 text-sm text-foreground outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setReplying(false)}
                className="rounded-md hairline px-3 py-1 text-xs text-foreground hover:bg-surface-2"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={busy}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Enviando…" : "Publicar"}
              </button>
            </div>
          </div>
        )}

        {reply.children.map((c) => (
          <ThreadReply key={c.id} reply={c} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}
