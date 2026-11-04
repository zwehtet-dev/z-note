import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { NoteEditor } from "@/components/note-editor";
import { getNote } from "@/lib/notes";

export default async function NotePage({ params, searchParams }: PageProps<"/notes/[id]">) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  const note = await getNote(id);
  if (!note) notFound();
  return (
    <AppShell q={typeof q === "string" ? q : ""} activeId={id}>
      <NoteEditor key={note.id} note={note} />
    </AppShell>
  );
}
