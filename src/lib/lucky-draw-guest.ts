// Guest identity helpers for the public lucky draw flow.
// Members who are not logged in get a stable client-side id + name
// so they can join a room without creating an account.

const GUEST_ID_KEY = "ld_guest_id"
const GUEST_NAME_KEY = "ld_guest_name"
const LD_USER_KEY = "ld_user"

export function randomHex(len = 6): string {
  const s = Math.random().toString(36).slice(2, 10)
  return s.padEnd(len, "0").slice(0, len).toUpperCase()
}

export function getGuestId(): string {
  if (typeof window === "undefined") return "guest"
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = `guest_${randomHex(8)}`
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

export function getGuestName(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(GUEST_NAME_KEY) || ""
}

export function setGuestName(name: string): void {
  localStorage.setItem(GUEST_NAME_KEY, name)
}

// Registers the current identity (logged-in user OR guest) so the
// lucky-draw service can stamp hosts/participants consistently.
export function registerIdentity(opts: {
  userId?: string
  name: string
}): { userId: string; name: string } {
  const guestId = getGuestId()
  const userId = opts.userId || guestId
  const user = { uid: userId, name: opts.name }

  if (typeof window !== "undefined") {
    localStorage.setItem(LD_USER_KEY, JSON.stringify(user))
    ;(window as any).__LD_USER__ = user
    ;(window as any).__LD_USER_NAME__ = opts.name
  }
  return { userId, name: user.name }
}

export function getRegisteredIdentity(): { uid: string; name: string } | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(LD_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}