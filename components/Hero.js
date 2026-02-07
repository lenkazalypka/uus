import React from 'react'
import Link from 'next/link'
import styles from '../styles/Hero.module.css'

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.badge}>🚀 НОВАЯ ЭРА ОБУЧЕНИЯ</span>

        <h1 className={styles.title}>
          UUS <span className={styles.gradient}>Online</span>
        </h1>

        <p className={styles.subtitle}>Pinterest-стиль × Качественные курсы × Живое сообщество</p>

        <p className={styles.text}>
          Изучайте новые навыки с экспертами. Создавайте и делитесь знаниями в современной
          образовательной среде.
        </p>

        <div className={styles.actions}>
          <Link href="/catalog" className={styles.primary}>
            Начать учиться
          </Link>
          <Link href="/add-course" className={styles.secondary}>
            Стать автором
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
