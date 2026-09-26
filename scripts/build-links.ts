/** Resolve encoded same-page fragments without treating plus signs as spaces. */
export function resolveFragmentTarget(document: Document, href: string): HTMLElement | null {
  const fragment = href.slice(1);
  let id = fragment;
  try { id = decodeURIComponent(fragment); } catch { /* Keep literal percent signs in authored ids. */ }
  return document.getElementById(id);
}
