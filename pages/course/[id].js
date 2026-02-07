import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../../lib/supabaseClient'
import { fetchCourseById, createPurchase } from '../../lib/api'
import styles from '../../styles/CoursePage.module.css'

// Функция для безопасного извлечения embed URL из любого формата
const getEmbedUrl = (input) => {
  if (!input) return null;
  
  // Если это уже прямой embed URL вида rutube.ru/play/embed/
  if (input.includes('rutube.ru/play/embed/')) {
    return input.trim();
  }
  
  // Если вставлен полный iframe, извлекаем src
  if (input.includes('<iframe')) {
    const srcMatch = input.match(/src=['"]([^'"]+)['"]/);
    if (srcMatch) return srcMatch[1];
  }
  
  // Если это обычная ссылка на видео, пытаемся преобразовать
  if (input.includes('rutube.ru/video/')) {
    const match = input.match(/video\/([a-zA-Z0-9]+)/);
    if (match) return `https://rutube.ru/play/embed/${match[1]}`;
  }
  
  return null;
};

export default function CoursePage() {
  const router = useRouter()
  const { id } = router.query

  const [course, setCourse] = useState(null)
  const [user, setUser] = useState(null)
  const [isPurchased, setIsPurchased] = useState(false)
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setLoading(true)

      try {
        // Загружаем курс
        const courseData = await fetchCourseById(id)
        if (!courseData) {
          router.push('/catalog')
          return
        }
        setCourse(courseData)

        // Получаем текущего пользователя
        const { data } = await supabase.auth.getSession()
        const currentUser = data?.session?.user
        setUser(currentUser)

        // Проверяем покупку напрямую в базе данных
        if (currentUser) {
          const { data: purchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('course_id', id)
            .maybeSingle()

          setIsPurchased(!!purchase)
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    const success = await createPurchase(user.id, id)
    if (success) {
      setIsPurchased(true)
      setSuccessMsg('🎉 Спасибо за покупку! Доступ открыт.')
    } else {
      alert('Ошибка при покупке курса')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div style={{ padding: '80px 0', textAlign: 'center' }}>Загрузка...</div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container">
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <h2>Курс не найден</h2>
          <a href="/catalog">Вернуться в каталог</a>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    if (price === 0) return 'Бесплатно'
    return `${price.toLocaleString('ru-RU')} ₽`
  }

  // Получаем embed URL из сохраненного кода
  const embedUrl = getEmbedUrl(course.video_embed_code)

  return (
    <>
      <Head>
        <title>{course.title} - UUS Online</title>
      </Head>

      <div className={styles.wrap}>
        <div className={styles.head}>
          <div className={styles.cover}>
            <img src={course.cover_url || '/placeholder.jpg'} alt={course.title} />
          </div>

          <div className={styles.body}>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.desc}>{course.description}</p>

            <div className={styles.priceRow}>
              <div className={styles.price}>{formatPrice(course.price)}</div>
            </div>

            <div className={styles.actions}>
              {isPurchased ? (
                <button className={`${styles.btn} ${styles.primary}`} disabled>
                  ✓ Доступ открыт
                </button>
              ) : (
                <button onClick={handlePurchase} className={`${styles.btn} ${styles.primary}`}>
                  Купить курс
                </button>
              )}
            </div>

            {successMsg && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  background: 'linear-gradient(90deg,#b5ffda,#e8fff3)',
                  borderRadius: 12,
                  fontWeight: 500,
                }}
              >
                {successMsg}
              </div>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {isPurchased ? (
            embedUrl ? (
              <div style={{ marginTop: 18 }}>
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="480"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={`Видео курса: ${course.title}`}
                  style={{ borderRadius: '8px', border: 'none' }}
                />
              </div>
            ) : (
              <div style={{ background: '#fff', padding: 28, borderRadius: 12 }}>
                <h3>Видео не задано</h3>
                <p>Автор ещё не загрузил видео или указан некорректный код</p>
              </div>
            )
          ) : (
            <div style={{ background: '#fff', padding: 28, borderRadius: 12 }}>
              <h3>Что внутри курса?</h3>
              <p>Купите курс, чтобы получить доступ к видео</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}