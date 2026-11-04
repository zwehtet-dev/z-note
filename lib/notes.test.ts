import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import * as notes from "@/lib/notes";

vi.mock("@/lib/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { SCHEMA_SQL } = await import("@/lib/schema");
  const pg = new PGlite();
  await pg.exec(SCHEMA_SQL);
  const sql = async (strings: TemplateStringsArray, ...values: unknown[]) =>
    (await pg.query(strings.reduce((text, s, i) => text + "$" + i + s), values)).rows;
  return { db: async () => sql };
});

beforeEach(async () => { const sql = await db(); await sql`TRUNCATE notes`; });

// PGlite's clock is ms-resolution (Postgres is µs), so back-to-back writes can share a timestamp.
const tick = () => new Promise((r) => setTimeout(r, 5));

it("creates an empty unpinned note", async () => {
  const id = await notes.createNote();
  expect(await notes.getNote(id)).toMatchObject({ id, content: "", pinned: false });
});

it("returns null for malformed and unknown ids without throwing", async () => {
  expect(await notes.getNote("abc")).toBeNull();
  expect(await notes.getNote("3f1c2b9e-8a4d-4c1e-9b7a-2d5e6f708192")).toBeNull();
  expect(await notes.updateNoteContent("3f1c2b9e-8a4d-4c1e-9b7a-2d5e6f708192", "x")).toBeNull();
});

it("orders pinned first, then most recently updated", async () => {
  const a = await notes.createNote();
  const b = await notes.createNote();
  const c = await notes.createNote();
  await tick(); await notes.updateNoteContent(b, "# B");
  await tick(); await notes.updateNoteContent(a, "# A");
  await notes.togglePin(c);
  expect((await notes.listNotes()).map((n) => n.id)).toEqual([c, a, b]);
});

it("derives titles from content", async () => {
  const id = await notes.createNote();
  await notes.updateNoteContent(id, "# Groceries\nmilk");
  expect((await notes.listNotes())[0].title).toBe("Groceries");
});

it("pinning does not change updatedAt; saving does", async () => {
  const id = await notes.createNote();
  const before = (await notes.getNote(id))!.updatedAt;
  await notes.togglePin(id);
  expect((await notes.getNote(id))!.updatedAt).toEqual(before);
  await tick();
  const saved = await notes.updateNoteContent(id, "new");
  expect(saved!.getTime()).toBeGreaterThan(before.getTime());
});

describe("search", () => {
  it("matches body text case-insensitively", async () => {
    const id = await notes.createNote();
    await notes.updateNoteContent(id, "title\nsay hello");
    expect((await notes.listNotes("HELLO")).map((n) => n.id)).toEqual([id]);
  });
  it("treats % and _ literally", async () => {
    const pct = await notes.createNote(); await notes.updateNoteContent(pct, "100% done");
    const other = await notes.createNote(); await notes.updateNoteContent(other, "1000 done axb");
    expect((await notes.listNotes("100%")).map((n) => n.id)).toEqual([pct]);
    expect(await notes.listNotes("a_b")).toEqual([]);
  });
});

it("deletes a note", async () => {
  const id = await notes.createNote();
  await notes.deleteNote(id);
  expect(await notes.getNote(id)).toBeNull();
  expect(await notes.listNotes()).toEqual([]);
});
