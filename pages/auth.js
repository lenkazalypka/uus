import Layout from '../components/Layout'
import styles from '../styles/Auth.module.css'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Auth() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!supabase) return
        const { data } = await supabase.auth.getSession()
        if (alive && data?.session) router.replace('/profile')
      } catch (e) {
        console.error('Auth useEffect error:', e)
      }
    })()
    return () => {
      alive = false
    }
  }, [router])

  const signIn = async () => {
    setErr('')
    setBusy(true)
    try {
      if (!supabase) {
        setErr('Supabase не настроен. Добавь .env.local')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErr(error.message)
      else router.push('/profile')
    } catch (e) {
      console.error('signIn error:', e)
      setErr('Не удалось войти.')
    } finally {
      setBusy(false)
    }
  }
  const signUp = async () => {
    setErr('')
    setBusy(true)
    try {
      if (!supabase) {
        setErr('Supabase не настроен. Добавь .env.local')
        return
      }
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setErr(error.message)
      else setErr('Ок. Подтверди почту (если включено) и войди.')
    } catch (e) {
      console.error('signUp error:', e)
      setErr('Не удалось зарегистрироваться.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout title="Вход">
      <div className={styles.wrap}>
        <div className={styles.card} data-animate>
          <h1 className={styles.h1}>Вход / Регистрация</h1>
          <div className={styles.muted}>Supabase Auth. Ключи — в .env.local.</div>
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.primary}`}
                onClick={signIn}
                disabled={busy}
              >
                Войти
              </button>
              <button className={styles.btn} onClick={signUp} disabled={busy}>
                Зарегистрироваться
              </button>
            </div>
          </div>
          {err ? <div className={styles.err}>{err}</div> : null}
          <div className={styles.note}>
            Если включено подтверждение email — после регистрации нужно подтвердить письмо.
          </div>
        </div>
      </div>
    </Layout>
  )
}
