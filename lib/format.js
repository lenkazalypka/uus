export function rub(n) {
  const num = Number(n ?? 0)
  if (!Number.isFinite(num) || num <= 0) return 'Бесплатно'
  try {
    return new Intl.NumberFormat('ru-RU').format(num) + ' ₽'
  } catch {
    return num + ' ₽'
  }
}

export function safeText(x, fallback = '') {
  if (x === null || x === undefined) return fallback
  return String(x)
}
