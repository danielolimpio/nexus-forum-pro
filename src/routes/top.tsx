import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/Feed";

export const Route = createFileRoute("/top")({
  head: () => ({
    meta: [
      { title: "Top — GroupeForum.pro" },
      { name: "description", content: "As discussões com mais respostas de todos os tempos." },
    ],
  }),
  component: () => <Feed title="Top discussões" sort="top" />,
});
