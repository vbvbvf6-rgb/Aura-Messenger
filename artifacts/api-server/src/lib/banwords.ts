import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

let cache: string[] = [];
let cacheExpiry = 0;

export async function getBanwords(): Promise<string[]> {
  if (Date.now() < cacheExpiry) return cache;
  try {
    const rows = await db.execute(sql`SELECT word FROM banwords ORDER BY id`);
    cache = (rows.rows as any[]).map(r => String(r.word).toLowerCase());
    cacheExpiry = Date.now() + 60_000;
  } catch {
    cache = [];
  }
  return cache;
}

export function invalidateBanwordsCache() {
  cacheExpiry = 0;
}

/** Returns the first matching banword or null. */
export function findBanword(text: string, banwords: string[]): string | null {
  if (!text || banwords.length === 0) return null;
  const lower = text.toLowerCase();
  return banwords.find(w => lower.includes(w)) ?? null;
}
