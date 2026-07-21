import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/Feed";

const NEWS_CATEGORIES = ["tecnologia", "negocios", "ciencia", "politica", "economia", "mercado"];

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — GroupeForum.pro" },
      { name: "description", content: "Discussões sobre notícias e atualidades." },
    ],
  }),
  component: () => (
    <Feed
      title="Notícias"
      sort="recent"
      categories={NEWS_CATEGORIES}
      emptyText="Nenhuma discussão de notícias no momento."
    />
  ),
});
