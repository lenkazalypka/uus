const LS_PROFILE = 'uus_profile'
const LS_PURCHASES = 'uus_purchases'

export function getUserProfileLS() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(LS_PROFILE) || 'null')
  } catch {
    return null
  }
}

export function getPurchasesLS() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_PURCHASES) || '[]')
  } catch {
    return []
  }
}

export function savePurchaseLS(p) {
  if (typeof window === 'undefined') return
  const cur = getPurchasesLS()
  localStorage.setItem(LS_PURCHASES, JSON.stringify([p, ...cur]))
}
