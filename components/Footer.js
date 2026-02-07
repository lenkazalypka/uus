import React from 'react'
import Link from 'next/link'
import styles from '../styles/Footer.module.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              UUS
            </span>
            <span style={{ color: 'var(--text)' }}>Online</span>
          </div>
          <div className={styles.brandText}>
            Современная платформа для обучения и развития
          </div>
        </div>

        <div className={styles.cols}>
          <div className={styles.col}>
            <div className={styles.colTitle}>Платформа</div>
            <Link href="/catalog" className={styles.a}>Каталог курсов</Link>
            <Link href="/profile" className={styles.a}>Личный кабинет</Link>
            <Link href="/add-course" className={styles.a}>Для авторов</Link>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Поддержка</div>
            <a href="mailto:support@uuss.online" className={styles.a}>
              support@uuss.online
            </a>
            <a href="tel:+78001234567" className={styles.a}>
              8 (800) 123-45-67
            </a>
          </div>

          <div className={styles.col}>
            <div className={styles.colTitle}>Правовая информация</div>
<Link href="/privacy" className={styles.a}>
  Политика конфиденциальности
</Link>

<Link href="/offer" className={styles.a}>
  Договор оферты
</Link>

<Link href="/requisites" className={styles.a}>
  Реквизиты
</Link>

          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.meta}>
          © {currentYear} UUS Online. Все права защищены.
          <br />
          ИП Иннокентьева П.А. · ИНН 141902060960 · ОГРНИП 318144700042011
        </div>
      </div>
    </footer>
  )
}

export default Footer
