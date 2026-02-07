import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/Login.module.css'

export default function Login() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Вход
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        router.push('/profile')
      } else {
        // Регистрация
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              role: 'user',
            },
          },
        })

        if (error) throw error

        alert('Регистрация успешна! Проверьте вашу почту для подтверждения.')
        setIsLogin(true)
        setFormData({ email: '', password: '', full_name: '' })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>{isLogin ? 'Вход' : 'Регистрация'} - Uus Online</title>
      </Head>

      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{isLogin ? 'Вход в аккаунт' : 'Создать аккаунт'}</h1>
            <p className={styles.subtitle}>
              {isLogin ? 'Введите свои данные для входа' : 'Заполните форму для регистрации'}
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="full_name" className={styles.label}>
                  Имя и фамилия
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Иван Иванов"
                  required={!isLogin}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>

            {isLogin && (
              <div className={styles.forgot}>
                <a href="#" className={styles.forgotLink}>
                  Забыли пароль?
                </a>
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>

            <div className={styles.switch}>
              <span>{isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}</span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={styles.switchButton}
              >
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
