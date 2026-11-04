"use client";

import { useEffect, useRef, useState } from "react";
import { Pin } from "lucide-react";
import { saveNoteAction, togglePinAction } from "@/app/actions";
import { DeleteNoteButton } from "@/components/delete-note-button";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createAutosaver, type SaveStatus } from "@/lib/autosave";
import type { Note } from "@/lib/notes";
import { cn } from "@/lib/utils";

type View = "edit" | "split" | "preview";
const VIEW_KEY = "znote:view";
const STATUS_TEXT: Record<SaveStatus, string> = {
  saved: "Saved",
  pending: "Saving…",
  saving: "Saving…",
  error: "Save failed",
};

export function NoteEditor({ note }: { note: Note }) {
  // Initialized once: later `note` props from revalidation must not overwrite typing.
  const [content, setContent] = useState(note.content);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [view, setView] = useState<View>("split");
  // One autosaver per component instance (keyed by note id). Cache Components hides pages in <Activity>
  // instead of unmounting them, so unsaved state must survive hide/show; cleanup only flushes.
  const saver = useRef<ReturnType<typeof createAutosaver<string>>>(null);
  saver.current ??= createAutosaver<string>({
    save: (c) => saveNoteAction(note.id, c),
    delay: 800,
    onStatus: setStatus,
  });

  useEffect(() => {
    const s = saver.current!;
    return () => void s.flush();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is client-only; server renders the default
      if (saved === "edit" || saved === "split" || saved === "preview") setView(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (status === "saved") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  function changeView(v: string) {
    if (!v) return;
    setView(v as View);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={changeView}>
          <ToggleGroupItem value="edit">Edit</ToggleGroupItem>
          <ToggleGroupItem value="split">Split</ToggleGroupItem>
          <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
        </ToggleGroup>
        <span className="flex-1 truncate text-sm text-muted-foreground" aria-live="polite">
          {STATUS_TEXT[status]}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Pin note"
          aria-pressed={note.pinned}
          onClick={() => togglePinAction(note.id)}
        >
          <Pin className={cn(note.pinned && "fill-current")} />
        </Button>
        <DeleteNoteButton id={note.id} />
      </div>
      <div className={cn("grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]", view === "split" && "md:grid-cols-2")}>
        {view !== "preview" && (
          <textarea
            aria-label="Note content"
            placeholder="Start writing…"
            autoFocus={note.content === ""}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              saver.current!.update(e.target.value);
            }}
            className="h-full w-full resize-none overflow-y-auto bg-transparent p-6 font-mono text-sm outline-none"
          />
        )}
        {view !== "edit" && (
          <div className={cn("overflow-y-auto p-6", view === "split" && "hidden border-l md:block")}>
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
