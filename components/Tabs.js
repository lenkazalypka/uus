import styles from '@/styles/Tabs.module.css'

export default function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Вкладки">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={`${styles.tab} ${active === t.key ? styles.active : ''}`}
          onClick={() => onChange?.(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
