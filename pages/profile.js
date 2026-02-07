import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { fetchLikedCourses, fetchPurchasedCourses } from '../lib/api'
import CourseCard from '../components/CourseCard'
import MasonryGrid from '../components/MasonryGrid'
import styles from '../styles/Profile.module.css'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [likedCourses, setLikedCourses] = useState([])
  const [purchasedCourses, setPurchasedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('purchased')

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      setProfile(profileData)

      const [liked, purchased] = await Promise.all([
        fetchLikedCourses(currentUser.id),
        fetchPurchasedCourses(currentUser.id),
      ])

      setLikedCourses(liked)
      setPurchasedCourses(purchased)
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="container">
        <div style={{ padding: '80px 0', textAlign: 'center' }}>Загрузка профиля...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Личный кабинет - Uus Online</title>
      </Head>

      <div className="container">
        <div className={styles.header}>
          <div className={styles.avatar}>
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || 'avatar'}
                width={80}
                height={80}
                unoptimized
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <h1 className={styles.name}>{profile?.full_name || 'Пользователь'}</h1>
            <p className={styles.email}>{user?.email}</p>
            <div className={styles.role}>
              <span
                className={`${styles.roleBadge} ${profile?.role === 'author' ? styles.author : ''}`}
              >
                {profile?.role === 'author' ? 'Автор' : 'Студент'}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            {profile?.role === 'author' && (
              <Link href="/add-course" className={styles.addButton}>
                + Добавить курс
              </Link>
            )}
            <button onClick={handleSignOut} className={styles.logoutButton}>
              Выйти
            </button>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{purchasedCourses.length}</div>
            <div className={styles.statLabel}>Куплено курсов</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{likedCourses.length}</div>
            <div className={styles.statLabel}>В избранном</div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'purchased' ? styles.active : ''}`}
            onClick={() => setActiveTab('purchased')}
          >
            Купленные курсы
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'liked' ? styles.active : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            Избранное
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'purchased' ? (
            purchasedCourses.length > 0 ? (
              <MasonryGrid>
                {purchasedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </MasonryGrid>
            ) : (
              <div className={styles.empty}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <h3>Нет купленных курсов</h3>
                <p>Начните обучение, выбрав курс из каталога</p>
                <Link href="/catalog" className={styles.emptyButton}>
                  Перейти в каталог
                </Link>
              </div>
            )
          ) : likedCourses.length > 0 ? (
            <MasonryGrid>
              {likedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </MasonryGrid>
          ) : (
            <div className={styles.empty}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h3>Нет избранных курсов</h3>
              <p>Добавляйте понравившиеся курсы в избранное</p>
              <Link href="/catalog" className={styles.emptyButton}>
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
