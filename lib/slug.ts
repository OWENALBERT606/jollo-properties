/**
 * Converts a name string to a URL-safe slug.
 * "My Category" → "my-category"
 * "Mailo Land (Uganda)" → "mailo-land-uganda"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
