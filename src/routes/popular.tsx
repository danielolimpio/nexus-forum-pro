import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/Feed";

export const Route = createFileRoute("/popular")({
  head: () => ({
    meta: [
      { title: "Popular — GroupeForum.pro" },
      { name: "description", content: "Discussões populares e em alta no GroupeForum.pro." },
    ],
  }),
  component: () => <Feed title="Popular" sort="hot" />,
});
