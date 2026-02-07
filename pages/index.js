import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Hero from '../components/Hero'
import CategoryChips from '../components/CategoryChips'
import CourseCard from '../components/CourseCard'
import MasonryGrid from '../components/MasonryGrid'
import { fetchCategories, fetchCourses } from '../lib/api'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, coursesData] = await Promise.all([
          fetchCategories(),
          fetchCourses(null, 9),
        ])

        setCategories(categoriesData)
        setCourses(coursesData)
      } catch (error) {
        // optional: console.error('Home load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLikeToggle = (courseId, isLiked) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => (course.id === courseId ? { ...course, isLiked } : course))
    )
  }

  return (
    <>
      <Head>
        <title>UUS Online - Платформа для обучения</title>
        <meta name="description" content="Современная платформа для обучения и развития" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Hero />

      {categories.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Категории</h2>
            <CategoryChips categories={categories} />
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className="container">
          <div className={styles.top}>
            <h2 className={styles.sectionTitle}>Популярные курсы</h2>
            <Link href="/catalog" className={styles.viewAll}>
              Смотреть все →
            </Link>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Загрузка курсов...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className={styles.empty}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <h3>Курсы скоро появятся</h3>
              <p>Первые курсы добавляются прямо сейчас!</p>
              <Link href="/add-course" className={styles.emptyButton}>
                Стать первым автором
              </Link>
            </div>
          ) : (
            <>
              <MasonryGrid>
                {courses.map((course, index) => (
                  <div key={course.id} data-animate style={{ animationDelay: `${index * 0.1}s` }}>
                    <CourseCard course={course} onLikeToggle={handleLikeToggle} />
                  </div>
                ))}
              </MasonryGrid>

              <div className={styles.moreRow}>
                <Link href="/catalog" className={styles.more}>
                  Показать все курсы
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
