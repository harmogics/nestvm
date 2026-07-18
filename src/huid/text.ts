// Tiny presentation text helpers shared by device modules. Pure functions
// only — nothing semantic lives here.

export function truncate(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…" : text;
}
