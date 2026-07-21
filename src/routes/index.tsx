import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/Feed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GroupeForum.pro — Fórum profissional de discussões" },
      {
        name: "description",
        content:
          "Fórum profissional focado em texto. Discussões estruturadas, grupos por categoria e palavras-chave únicas que constroem autoridade.",
      },
    ],
  }),
  component: () => <Feed title="Discussões em destaque" sort="hot" />,
});
