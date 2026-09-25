/** Exact allowlist: a presentation deployment exposes no customer/staff writes. */
export function previewApiAllowed(pathname: string, method: string) {
  return pathname === "/api/pricing" && method === "GET";
}
