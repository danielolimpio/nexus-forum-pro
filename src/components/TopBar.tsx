import { Link } from "@tanstack/react-router";
import { Search, Bell, MessageSquare, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-1/80 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
            G
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">GroupeForum</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              .pro
            </span>
          </div>
        </Link>

        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full hairline bg-surface-2 px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Pesquisar discussões, grupos, palavras-chave…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex items-center gap-2 rounded-md hairline bg-surface-1 px-3 py-1.5 text-sm font-medium hover:bg-surface-2">
            <Plus className="h-4 w-4" /> Criar
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md hairline hover:bg-surface-2">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md hairline hover:bg-surface-2">
            <Bell className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <Link
            to="/perfil"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full hairline bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-semibold"
          >
            VS
          </Link>
        </div>
      </div>
    </header>
  );
}
