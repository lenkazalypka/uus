import styles from '@/styles/EmptyState.module.css'

export default function EmptyState({ title, desc, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.title}>{title}</div>
      {desc ? <div className={styles.desc}>{desc}</div> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
