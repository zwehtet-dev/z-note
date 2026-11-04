import { neon } from "@neondatabase/serverless";
import { SCHEMA_SQL } from "@/lib/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, any>[]>;

let ready: Promise<Sql> | undefined;

// Lazily connects and creates the schema once per server instance, so a fresh deploy needs no setup step.
export function db(): Promise<Sql> {
  ready ??= (async () => {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. See README.");
    const sql = neon(url);
    await sql.query(SCHEMA_SQL);
    return sql as unknown as Sql;
  })().catch((err) => {
    ready = undefined;
    throw err;
  });
  return ready;
}
