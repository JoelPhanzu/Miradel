/**
 * Limitation de débit en mémoire (un seul processus Node chez Hostinger).
 * Suffisant contre les envois répétés ; à remplacer par un stockage partagé si le site
 * tourne un jour sur plusieurs instances.
 */
const hits = new Map<string, number[]>()

function recent(key: string, windowMs: number): number[] {
  const now = Date.now()
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  hits.set(key, list)
  return list
}

/** Vérifie la limite PUIS compte cet essai (formulaires publics). */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const list = recent(key, windowMs)
  if (list.length >= limit) return true
  list.push(Date.now())
  if (hits.size > 5000) hits.clear()
  return false
}

/** Vérifie la limite sans compter d'essai (connexion : seuls les échecs comptent). */
export function isBlocked(key: string, limit: number, windowMs: number): boolean {
  return recent(key, windowMs).length >= limit
}

export function recordFailure(key: string): void {
  const list = hits.get(key) ?? []
  list.push(Date.now())
  hits.set(key, list)
  if (hits.size > 5000) hits.clear()
}
