/** True for `/propuestas` and `/propuestas/<slug>`. */
export function isProposalPath(url: string): boolean {
  const path = url.split(/[?#]/)[0] ?? '';
  return path === '/propuestas' || path.startsWith('/propuestas/');
}

/**
 * Fragment links are resolved against `<base href="/">`, so `#propuesta`
 * would leave the document for `/#propuesta`. Use the current path.
 */
export function skipTarget(url: string): string {
  if (!isProposalPath(url)) return '#work';
  const path = url.split(/[?#]/)[0] || '/propuestas';
  return `${path}#propuesta`;
}
