"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNote, deleteNote, togglePin, updateNoteContent } from "@/lib/notes";
import { isUuid, MAX_CONTENT_LENGTH } from "@/lib/notes-util";

export async function createNoteAction(): Promise<void> {
  const id = await createNote();
  revalidatePath("/", "layout");
  redirect(`/notes/${id}`);
}

export async function saveNoteAction(id: string, content: string): Promise<void> {
  if (!isUuid(id) || typeof content !== "string" || content.length > MAX_CONTENT_LENGTH) {
    throw new Error("Invalid note");
  }
  if (!(await updateNoteContent(id, content))) throw new Error("Note not found");
  revalidatePath("/", "layout");
}

export async function togglePinAction(id: string): Promise<void> {
  await togglePin(id);
  revalidatePath("/", "layout");
}

export async function deleteNoteAction(id: string): Promise<void> {
  await deleteNote(id);
  revalidatePath("/", "layout");
  redirect("/");
}
