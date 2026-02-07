import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/Header.module.css'

const Header = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>UUS</span>
          <span className={styles.logoRest}>Online</span>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.link} ${router.pathname === '/' ? styles.active : ''}`}
          >
            Главная
          </Link>
          <Link
            href="/catalog"
            className={`${styles.link} ${router.pathname === '/catalog' ? styles.active : ''}`}
          >
            Каталог
          </Link>

          {user ? (
            <>
              <Link
                href="/favorites"
                className={`${styles.link} ${router.pathname === '/favorites' ? styles.active : ''}`}
              >
                Избранное
              </Link>
              <Link
                href="/profile"
                className={`${styles.link} ${router.pathname === '/profile' ? styles.active : ''}`}
              >
                Профиль
              </Link>
              {profile?.role === 'author' && (
                <Link
                  href="/add-course"
                  className={`${styles.link} ${router.pathname === '/add-course' ? styles.active : ''}`}
                >
                  + Курс
                </Link>
              )}
              <button onClick={handleSignOut} className={styles.link}>
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={`${styles.link} ${router.pathname === '/login' ? styles.active : ''}`}
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
