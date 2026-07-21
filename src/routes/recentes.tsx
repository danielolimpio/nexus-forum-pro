import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/Feed";

export const Route = createFileRoute("/recentes")({
  head: () => ({
    meta: [
      { title: "Recentes — GroupeForum.pro" },
      { name: "description", content: "As perguntas mais recentes publicadas no fórum." },
    ],
  }),
  component: () => <Feed title="Recentes" sort="recent" />,
});
