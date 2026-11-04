import { describe, it, expect } from "vitest";
import { noteTitle, escapeLike, isUuid } from "./notes-util";

describe("noteTitle", () => {
  it("uses the first non-empty line, stripping heading markers", () => {
    expect(noteTitle("# Hello world\n\nbody")).toBe("Hello world");
    expect(noteTitle("\n\n  plain first line  \nmore")).toBe("plain first line");
  });
  it("falls back to Untitled", () => {
    expect(noteTitle("")).toBe("Untitled");
    expect(noteTitle("   \n\n")).toBe("Untitled");
    expect(noteTitle("###   ")).toBe("Untitled");
  });
});

describe("escapeLike", () => {
  it("escapes LIKE wildcards and the escape char", () => {
    expect(escapeLike("100%")).toBe("100\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
    expect(escapeLike("c:\\dir")).toBe("c:\\\\dir");
  });
});

describe("isUuid", () => {
  it("accepts uuids in any case and rejects the rest", () => {
    expect(isUuid("3f1c2b9e-8a4d-4c1e-9b7a-2d5e6f708192")).toBe(true);
    expect(isUuid("3F1C2B9E-8A4D-4C1E-9B7A-2D5E6F708192")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
  });
});
