export const MAX_CONTENT_LENGTH = 1_000_000;

export function noteTitle(content: string): string {
  for (const line of content.split("\n")) {
    const text = line.trim().replace(/^#{1,6}/, "").trim();
    if (text) return text;
  }
  return "Untitled";
}

export function escapeLike(q: string): string {
  return q.replace(/[\\%_]/g, "\\$&");
}

export function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
