import { useEffect } from 'react'
import styles from '@/styles/Modal.module.css'

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title || 'Окно'}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <div className={styles.title}>{title}</div>
          <button className={styles.close} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
      <button className={styles.clickCatcher} onClick={onClose} aria-label="Закрыть фон" />
    </div>
  )
}
