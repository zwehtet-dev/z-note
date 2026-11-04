import { db } from "@/lib/db";
import { escapeLike, isUuid, noteTitle } from "@/lib/notes-util";

export type NoteSummary = { id: string; title: string; pinned: boolean; updatedAt: Date };
export type Note = { id: string; content: string; pinned: boolean; updatedAt: Date };

// ponytail: no pagination or index; add both past ~1k notes
export async function listNotes(query?: string): Promise<NoteSummary[]> {
  const sql = await db();
  const q = query?.trim();
  const rows = q
    ? await sql`SELECT id, left(content, 200) AS head, pinned, updated_at FROM notes
        WHERE content ILIKE '%' || ${escapeLike(q)} || '%' ORDER BY pinned DESC, updated_at DESC`
    : await sql`SELECT id, left(content, 200) AS head, pinned, updated_at FROM notes
        ORDER BY pinned DESC, updated_at DESC`;
  return rows.map((r) => ({ id: r.id, title: noteTitle(r.head), pinned: r.pinned, updatedAt: new Date(r.updated_at) }));
}

export async function getNote(id: string): Promise<Note | null> {
  if (!isUuid(id)) return null;
  const sql = await db();
  const [r] = await sql`SELECT id, content, pinned, updated_at FROM notes WHERE id = ${id}`;
  return r ? { id: r.id, content: r.content, pinned: r.pinned, updatedAt: new Date(r.updated_at) } : null;
}

export async function createNote(): Promise<string> {
  const sql = await db();
  const [r] = await sql`INSERT INTO notes DEFAULT VALUES RETURNING id`;
  return r.id;
}

export async function updateNoteContent(id: string, content: string): Promise<Date | null> {
  if (!isUuid(id)) return null;
  const sql = await db();
  const [r] = await sql`UPDATE notes SET content = ${content}, updated_at = now() WHERE id = ${id} RETURNING updated_at`;
  return r ? new Date(r.updated_at) : null;
}

export async function togglePin(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const sql = await db();
  await sql`UPDATE notes SET pinned = NOT pinned WHERE id = ${id}`;
}

export async function deleteNote(id: string): Promise<void> {
  if (!isUuid(id)) return;
  const sql = await db();
  await sql`DELETE FROM notes WHERE id = ${id}`;
}
