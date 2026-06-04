import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Plus, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { CreatePostDialog } from "./CreatePostDialog";

export function TopBar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (profile?.display_name || profile?.username || user?.email || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-1/80 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-semibold">
            G
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">GroupeForum</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">.pro</span>
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
          <button
            onClick={() => (user ? setCreateOpen(true) : navigate({ to: "/auth" }))}
            className="hidden sm:inline-flex items-center gap-2 rounded-md hairline bg-surface-1 px-3 py-1.5 text-sm font-medium hover:bg-surface-2"
          >
            <Plus className="h-4 w-4" /> Nova pergunta
          </button>
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full hairline bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-semibold"
              >
                {initials}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 surface-card overflow-hidden text-sm"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate font-medium">u/{profile?.username ?? "..."}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-surface-2"
                  >
                    <UserIcon className="h-4 w-4" /> Meu perfil
                  </Link>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                      navigate({ to: "/auth" });
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-surface-2"
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
      <CreatePostDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </header>
  );
}
