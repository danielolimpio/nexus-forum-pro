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

export type FeedSort = "hot" | "recent" | "top";

export async function fetchPosts(
  limit = 30,
  sort: FeedSort = "recent",
  categories?: string[],
): Promise<PostRow[]> {
  let q = supabase
    .from("posts")
    .select(
      "id, title, body, keyword, created_at, group:groups!inner(slug,name,category), author:profiles(id,username,display_name,avatar_url), replies(count)",
    );
  if (categories && categories.length) q = q.in("groups.category", categories);
  if (sort === "hot") {
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    q = q.gte("created_at", since);
  }
  q = q.order("created_at", { ascending: false }).limit(sort === "top" ? 200 : limit * 2);
  const { data, error } = await q;
  if (error) throw error;
  const rows = ((data ?? []) as unknown as (PostRow & { replies: { count: number }[] })[])
    .filter((r) => r.group)
    .map((r) => ({ ...r, reply_count: r.replies?.[0]?.count ?? 0 }));
  if (sort === "top") {
    rows.sort((a, b) => (b.reply_count ?? 0) - (a.reply_count ?? 0));
  } else if (sort === "hot") {
    rows.sort((a, b) => {
      const ageA = (Date.now() - new Date(a.created_at).getTime()) / 3600000 + 2;
      const ageB = (Date.now() - new Date(b.created_at).getTime()) / 3600000 + 2;
      return (b.reply_count ?? 0) / ageB - (a.reply_count ?? 0) / ageA;
    });
  }
  return rows.slice(0, limit);
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

export type GroupRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  image_url: string | null;
  created_by: string | null;
  deleted_at: string | null;
  creator?: { username: string; display_name: string | null } | null;
};

const GROUP_SELECT =
  "id, slug, name, category, image_url, created_by, deleted_at, creator:profiles!groups_created_by_profiles_fkey(username, display_name)";

export async function fetchGroups(): Promise<GroupRow[]> {
  const { data, error } = await supabase
    .from("groups")
    .select(GROUP_SELECT)
    .is("deleted_at", null)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as GroupRow[];
}

export async function fetchGroupBySlug(slug: string): Promise<GroupRow | null> {
  const { data, error } = await supabase
    .from("groups")
    .select(GROUP_SELECT)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as GroupRow) ?? null;
}

export async function fetchPostsByGroup(groupId: string): Promise<PostRow[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, body, keyword, created_at, group:groups!inner(slug,name,category), author:profiles(id,username,display_name,avatar_url), replies(count)",
    )
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return ((data ?? []) as unknown as (PostRow & { replies: { count: number }[] })[])
    .filter((r) => r.group)
    .map((r) => ({ ...r, reply_count: r.replies?.[0]?.count ?? 0 }));
}

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  created_at: string;
  author: Author | null;
};

const ARTICLE_SELECT =
  "id, slug, title, excerpt, body, cover_url, created_at, author:profiles(id,username,display_name,avatar_url)";

export async function fetchArticles(limit = 30): Promise<ArticleRow[]> {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ArticleRow[];
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleRow | null> {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as ArticleRow) ?? null;
}

export async function generateUniqueArticleSlug(base: string): Promise<string> {
  const clean = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  if (!clean) throw new Error("Título inválido");
  const { data, error } = await supabase
    .from("articles")
    .select("slug")
    .or(`slug.eq.${clean},slug.like.${clean}-%`);
  if (error) throw error;
  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(clean)) return clean;
  let n = 1;
  while (taken.has(`${clean}-${n}`)) n++;
  return `${clean}-${n}`;
}

export async function fetchPendingDeletionGroups(userId: string): Promise<GroupRow[]> {
  const { data, error } = await supabase
    .from("groups")
    .select(GROUP_SELECT)
    .eq("created_by", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as GroupRow[];
}

export async function generateUniqueSlug(base: string): Promise<string> {
  const clean = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  if (!clean) throw new Error("Nome inválido");
  const { data, error } = await supabase
    .from("groups")
    .select("slug")
    .is("deleted_at", null)
    .or(`slug.eq.${clean},slug.like.${clean}-%`);
  if (error) throw error;
  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(clean)) return clean;
  let n = 1;
  while (taken.has(`${clean}-${n}`)) n++;
  return `${clean}-${n}`;
}

export async function softDeleteGroup(id: string) {
  const { error } = await supabase
    .from("groups")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
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
