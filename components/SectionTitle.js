import styles from '../styles/SectionTitle.module.css'
export default function SectionTitle({ title, desc }) {
  return (
    <div className={styles.wrap} data-animate>
      <h2 className={styles.title}>{title}</h2>
      {desc ? <p className={styles.desc}>{desc}</p> : null}
    </div>
  )
}
