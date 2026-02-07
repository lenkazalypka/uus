import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from '../../styles/PaymentPage.module.css'

export default function PaymentSuccess() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Симуляция проверки оплаты
    const timer = setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className={styles.spinner}></div>
            <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Проверка оплаты...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Оплата успешна - Uus Online</title>
      </Head>

      <div className={styles.wrap}>
        <div className={styles.card}>
          {success ? (
            <>
              <div className={styles.badge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Оплата успешно завершена
              </div>

              <h1 className={styles.title}>Спасибо за покупку!</h1>

              <p className={styles.text}>
                Курс успешно добавлен в вашу библиотеку. Теперь вы можете начать обучение. Доступ к
                материалам открыт сразу после оплаты.
              </p>

              <div className={styles.actions}>
                <Link href="/profile" className={styles.primary}>
                  Перейти к курсам
                </Link>
                <Link href="/catalog" className={styles.secondary}>
                  Вернуться в каталог
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.badgeFail}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Ошибка оплаты
              </div>

              <h1 className={styles.title}>Что-то пошло не так</h1>

              <p className={styles.text}>
                При обработке оплаты произошла ошибка. Пожалуйста, попробуйте снова или обратитесь в
                поддержку, если проблема повторится.
              </p>

              <div className={styles.actions}>
                <button onClick={() => router.back()} className={styles.primary}>
                  Попробовать снова
                </button>
                <Link href="/catalog" className={styles.secondary}>
                  Вернуться в каталог
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
