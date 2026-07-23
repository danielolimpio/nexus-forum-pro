import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { PostCard } from "@/components/PostCard";
import { fetchGroupBySlug, fetchPostsByGroup } from "@/lib/forum";
import { CATEGORIES } from "@/lib/categories";
import { Users } from "lucide-react";

export const Route = createFileRoute("/g/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `g/${params.slug} — GroupeForum.pro` },
      { name: "description", content: `Discussões do grupo g/${params.slug}.` },
      { property: "og:title", content: `g/${params.slug} — GroupeForum.pro` },
      { property: "og:description", content: `Discussões do grupo g/${params.slug}.` },
    ],
  }),
  component: GroupPage,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-10 text-center text-sm text-muted-foreground">
          Grupo não encontrado.
        </main>
      </div>
    </div>
  ),
});

function GroupPage() {
  const { slug } = Route.useParams();
  const { data: group, isLoading: loadingGroup } = useQuery({
    queryKey: ["group", slug],
    queryFn: () => fetchGroupBySlug(slug),
  });
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["group-posts", group?.id],
    queryFn: () => (group ? fetchPostsByGroup(group.id) : Promise.resolve([])),
    enabled: !!group,
  });

  if (!loadingGroup && !group) throw notFound();
  const category = group ? CATEGORIES.find((c) => c.value === group.category) : null;

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {group && (
              <header className="surface-card mb-4 p-5">
                <div className="flex items-center gap-4">
                  {group.image_url ? (
                    <img src={group.image_url} alt="" className="h-14 w-14 rounded-md object-cover" />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-md bg-surface-2">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h1 className="text-lg font-semibold">g/{group.slug}</h1>
                    <p className="truncate text-sm text-muted-foreground">
                      {group.name} {category ? `· ${category.label}` : ""}
                    </p>
                    {group.creator && (
                      <p className="text-[11px] text-muted-foreground">
                        Criado por u/{group.creator.username}
                      </p>
                    )}
                  </div>
                </div>
              </header>
            )}

            {loadingPosts ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : posts.length === 0 ? (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                Ainda não há discussões neste grupo.{" "}
                <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </div>
        </main>
        <TrendingPanel />
      </div>
    </div>
  );
}
