import { supabase } from "@/integrations/supabase/client";

export type Author = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type PostRow = {
  id: string;
  title: string;
  body: string;
  keyword: string;
  created_at: string;
  group: { slug: string; name: string; category: string } | null;
  author: Author | null;
  reply_count?: number;
};

export type ReplyRow = {
  id: string;
  post_id: string;
  parent_id: string | null;
  body: string;
  depth: number;
  created_at: string;
  author: Author | null;
};

export type ReplyNode = ReplyRow & { children: ReplyNode[] };

export function normalizeKeyword(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchPosts(limit = 30): Promise<PostRow[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, body, keyword, created_at, group:groups(slug,name,category), author:profiles(id,username,display_name,avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as PostRow[];
}

export async function fetchPost(id: string): Promise<PostRow | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, body, keyword, created_at, group:groups(slug,name,category), author:profiles(id,username,display_name,avatar_url)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as PostRow) ?? null;
}

export async function fetchReplies(postId: string): Promise<ReplyNode[]> {
  const { data, error } = await supabase
    .from("replies")
    .select(
      "id, post_id, parent_id, body, depth, created_at, author:profiles(id,username,display_name,avatar_url)",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as unknown as ReplyRow[];
  const map = new Map<string, ReplyNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: ReplyNode[] = [];
  rows.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parent_id && map.has(r.parent_id)) map.get(r.parent_id)!.children.push(node);
    else roots.push(node);
  });
  return roots;
}

export async function fetchGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("id, slug, name, category")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTrendingKeywords(limit = 8): Promise<string[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("keyword, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r: { keyword: string }) => r.keyword);
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} d`;
}
