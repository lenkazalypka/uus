const safeParse = (v, fallback) => {
  try {
    return JSON.parse(v)
  } catch {
    return fallback
  }
}
export function getLS(key, fallback) {
  if (typeof window === 'undefined') return fallback
  return safeParse(window.localStorage.getItem(key), fallback)
}
export function setLS(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}
export function uidKey(user) {
  return user?.id ? `u:${user.id}` : 'guest'
}
