import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import CategoryChips from '../components/CategoryChips'
import CourseCard from '../components/CourseCard'
import MasonryGrid from '../components/MasonryGrid'
import { fetchCategories, fetchCourses } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/CatalogPage.module.css'

export default function Catalog() {
  const router = useRouter()
  const { category: categorySlug } = router.query

  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState('')

  // 🔧 ИСПРАВЛЕНИЕ: функция для безопасного получения categorySlug
  const getSafeCategorySlug = () => {
    if (!categorySlug) return null
    // Преобразуем 'null' или 'undefined' строки в null
    if (categorySlug === 'null' || categorySlug === 'undefined') return null
    return categorySlug
  }

  // Load categories immediately (public)
  useEffect(() => {
    let mounted = true
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories()
        if (mounted) setCategories(categoriesData || [])
      } catch (err) {
        console.error('fetchCategories error', err)
        if (mounted) setCategories([])
      }
    }
    loadCategories()
    return () => {
      mounted = false
    }
  }, [])

  // Init auth and subscribe to auth state change
  useEffect(() => {
    let mounted = true
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const currentUser = data?.session?.user ?? null
        if (mounted) setUser(currentUser)
      } catch (err) {
        console.warn('auth.getSession error', err)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setAuthReady(true)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setAuthReady(true)
    })

    return () => {
      authListener?.subscription?.unsubscribe?.()
      if (authListener?.unsubscribe) authListener.unsubscribe()
      mounted = false
    }
  }, [])

  // Load courses only after authReady (prevents RLS race condition)
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      try {
        // Wait until auth subsystem initialized
        if (!authReady) return

        // 🔧 ИСПРАВЛЕНИЕ: Используем безопасное получение categorySlug
        const safeCategorySlug = getSafeCategorySlug()
        const coursesData = await fetchCourses(safeCategorySlug)
        setCourses(coursesData || [])
        // 🔧 ИСПРАВЛЕНИЕ: Исправляем setSelectedCategory
        setSelectedCategory(safeCategorySlug)
      } catch (error) {
        console.error('Error loading courses:', error)
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [categorySlug, authReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // 🔧 ИСПРАВЛЕНИЕ: Правильная обработка выбора категории
  const handleCategorySelect = (slug) => {
    // Если slug равен null, undefined, пустой строке или 'null' - переходим на чистый каталог
    if (!slug || slug === 'null' || slug === 'undefined') {
      router.push('/catalog', undefined, { shallow: true })
    } else {
      // Если уже выбрана эта категория - снимаем выбор (переходим на чистый каталог)
      if (slug === selectedCategory) {
        router.push('/catalog', undefined, { shallow: true })
      } else {
        router.push(`/catalog?category=${slug}`, undefined, { shallow: true })
      }
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  // Безопасная фильтрация (защита от undefined)
  const filteredCourses = courses.filter((course) => {
    const title = (course?.title || '').toString().toLowerCase()
    const desc = (course?.description || '').toString().toLowerCase()
    const q = (search || '').toLowerCase()
    return title.includes(q) || desc.includes(q)
  })

  const handleLikeToggle = (courseId, isLiked) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => (course.id === courseId ? { ...course, isLiked } : course))
    )
  }

  return (
    <>
      <Head>
        <title>Каталог курсов - Uus Online</title>
        <meta name="description" content="Изучайте новые навыки с лучшими экспертами" />
      </Head>

      <div className="container">
        <div className={styles.top}>
          <h1 className={styles.h1}>Каталог курсов</h1>
          <input
            type="text"
            placeholder="Поиск курсов..."
            className={styles.search}
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.filters}>
          {/* 🔧 ИСПРАВЛЕНИЕ: Передаем правильное значение selectedCategory */}
          <CategoryChips
            categories={categories}
            selectedCategory={getSafeCategorySlug()} // Используем безопасное значение
            onSelect={handleCategorySelect}
          />
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            Загрузка курсов...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <h3>Курсы не найдены</h3>
            <p>Попробуйте изменить поисковый запрос или категорию</p>
          </div>
        ) : (
          <MasonryGrid>
            {filteredCourses.map((course, index) => (
              <div key={course.id} data-animate style={{ animationDelay: `${index * 0.05}s` }}>
                {/* Передаём user проп в CourseCard — чтобы компонент не делал getUser сам */}
                <CourseCard course={course} user={user} onLikeToggle={handleLikeToggle} />
              </div>
            ))}
          </MasonryGrid>
        )}
      </div>
    </>
  )
}