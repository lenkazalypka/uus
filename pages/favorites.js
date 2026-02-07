import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { fetchLikedCourses } from '../lib/api'
import CourseCard from '../components/CourseCard'
import Head from 'next/head'

export default function Favorites() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Проверяем авторизацию
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Ключевое исправление: редирект на страницу входа
        router.push('/auth?redirect=/favorites')
        return
      }
      
      setUser(session.user)
      loadFavorites(session.user.id)
    }
    
    checkAuth()
    
    // Слушаем изменения авторизации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          router.push('/auth?redirect=/favorites')
        } else {
          setUser(session.user)
        }
      }
    )
    
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  const loadFavorites = async (userId) => {
    try {
      setLoading(true)
      const liked = await fetchLikedCourses(userId)
      setCourses(liked || [])
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Показываем заглушку во время редиректа
  if (!user && loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
        <p>Проверка авторизации...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container">
        <h1>Избранное</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Загрузка избранных курсов...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Избранное | UUS Online</title>
        <meta name="description" content="Ваши избранные курсы" />
      </Head>
      
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Избранное</h1>
        
        {courses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#6c757d' }}>
              Здесь пока пусто
            </h3>
            <p style={{ marginBottom: '25px', color: '#6c757d' }}>
              Добавляйте курсы в избранное, чтобы вернуться к ним позже
            </p>
            <button
              onClick={() => router.push('/catalog')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Перейти в каталог
            </button>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: '20px', color: '#6c757d' }}>
              {courses.length} {courses.length === 1 ? 'курс' : 
                courses.length > 1 && courses.length < 5 ? 'курса' : 'курсов'}
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '25px',
              marginTop: '20px'
            }}>
              {courses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={{ ...course, isLiked: true }} 
                  showCategory={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}