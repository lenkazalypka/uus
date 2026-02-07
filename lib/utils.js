export function rub(amount) {
  const n = Number(amount || 0)
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}

export function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16)
}

export function safeTrim(s) {
  return typeof s === 'string' ? s.trim() : ''
}

export function norm(s) {
  return safeTrim(s).toLowerCase()
}

export function ensureEmbedUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (url.includes('/embed/')) return url

  const ytMatch = url.match(/[?&]v=([^&]+)/)
  if (ytMatch && ytMatch[1]) return 'https://www.youtube.com/embed/' + ytMatch[1]

  const youtuBe = url.match(/youtu\.be\/([^?&]+)/)
  if (youtuBe && youtuBe[1]) return 'https://www.youtube.com/embed/' + youtuBe[1]

  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo && vimeo[1]) return 'https://player.vimeo.com/video/' + vimeo[1]

  return url
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}
