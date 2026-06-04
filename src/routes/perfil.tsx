import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrendingPanel } from "@/components/TrendingPanel";
import { Camera, Pencil, Award, MessageSquare, Hash } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — GroupeForum.pro" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <section className="surface-card overflow-hidden">
              <div className="relative h-44 bg-gradient-to-br from-primary/80 via-primary to-accent">
                <button className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/30 px-2.5 py-1 text-xs text-white backdrop-blur hover:bg-black/40">
                  <Camera className="h-3.5 w-3.5" /> Trocar capa
                </button>
              </div>

              <div className="flex items-end gap-4 px-6 pb-5 -mt-10">
                <div className="relative">
                  <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-surface-1 bg-gradient-to-br from-accent to-primary text-xl font-semibold text-primary-foreground">
                    VS
                  </div>
                  <button className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full hairline bg-surface-1 hover:bg-surface-2">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex-1 pb-1">
                  <h1 className="text-lg font-semibold">u/voce.sobrenome</h1>
                  <p className="text-xs text-muted-foreground">
                    Membro desde 2026 · Negócios, Tecnologia, Engenharia
                  </p>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-md hairline bg-surface-1 px-3 py-1.5 text-sm hover:bg-surface-2">
                  <Pencil className="h-3.5 w-3.5" /> Editar perfil
                </button>
              </div>

              <div className="grid grid-cols-3 border-t border-border">
                {[
                  { icon: Award, label: "Reputação", value: "1.284" },
                  { icon: MessageSquare, label: "Discussões", value: "37" },
                  { icon: Hash, label: "Palavras-chave", value: "12" },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 border-r border-border px-5 py-4 last:border-r-0"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-md hairline bg-surface-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold tabular-nums">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-5 surface-card p-5">
              <h2 className="text-sm font-semibold">Sobre</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Profissional em transição para áreas analíticas. Aqui para discutir
                arquitetura, gestão e estratégia com profundidade.
              </p>
            </section>
          </div>
        </main>
        <TrendingPanel />
      </div>
    </div>
  );
}
