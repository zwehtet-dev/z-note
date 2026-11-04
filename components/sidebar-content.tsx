import Link from "next/link";
import { Pin, Plus } from "lucide-react";
import { createNoteAction } from "@/app/actions";
import { Logo } from "@/components/logo";
import { SearchInput } from "@/components/search-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { NoteSummary } from "@/lib/notes";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function NewNoteButton({ className }: { className?: string }) {
  return (
    <form action={createNoteAction}>
      <Button type="submit" variant="outline" className={className}>
        <Plus />
        New note
      </Button>
    </form>
  );
}

export function SidebarContent({ notes, q, activeId }: { notes: NoteSummary[]; q: string; activeId?: string }) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return (
    <div className="flex h-full w-full flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <Logo />
        <span className="flex-1 font-medium">Z Note</span>
        <ThemeToggle />
      </div>
      <NewNoteButton className="w-full" />
      <SearchInput defaultValue={q} />
      <nav className="-mx-1 flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {q ? `No notes match "${q}"` : "No notes yet"}
          </p>
        ) : (
          notes.map((n) => (
            <Link
              key={n.id}
              href={`/notes/${n.id}${query}`}
              className={cn("block rounded-md px-2 py-2 hover:bg-muted", n.id === activeId && "bg-muted")}
            >
              <span className="flex items-center gap-1.5">
                <span className="flex-1 truncate text-sm font-medium">{n.title}</span>
                {n.pinned && <Pin className="size-3.5 shrink-0 text-muted-foreground" aria-label="Pinned" />}
              </span>
              <span className="text-xs text-muted-foreground">{dateFormat.format(n.updatedAt)}</span>
            </Link>
          ))
        )}
      </nav>
    </div>
  );
}
