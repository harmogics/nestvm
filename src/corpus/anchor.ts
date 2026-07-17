// Shared heading-anchor derivation: the corpus index and the markdown
// renderer must agree on ids, so evidence references land on their section.

export function anchorOf(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[`*_[\]()]/g, "")
    .replace(/[^a-z0-9\s§.-]/g, "")
    .trim()
    .replace(/[\s§.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
