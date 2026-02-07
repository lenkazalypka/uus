import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { fetchCategories } from '../lib/api'
import styles from '../styles/AddCourse.module.css'

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'

// Вспомогательная функция: пытается извлечь src из iframe, если пользователь вставил полный HTML.
const extractEmbedCode = (input) => {
  if (!input) return input;
  // Пытаемся найти src='...' или src="..." внутри iframe
  const srcMatch = input.match(/src=['"]([^'"]+)['"]/);
  // Если нашли src, возвращаем только ссылку. Если нет — возвращаем как есть.
  return srcMatch ? srcMatch[1] : input.trim();
};

// ================= IMAGE UPLOADER =================
function ImageUploader({ onUploadComplete, disabled }) {
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const filePath = `covers/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('COURSE-COVERS')
        .upload(filePath, file, { upsert: true })

      if (error) throw error

      const { data } = supabase.storage
        .from('COURSE-COVERS')
        .getPublicUrl(filePath)

      onUploadComplete(data.publicUrl)
    } catch (err) {
      console.error(err)
      alert('Ошибка загрузки обложки')
      setPreview('')
      onUploadComplete(DEFAULT_COVER)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(localUrl)
    }
  }

  return (
    <div className={styles.formGroupFull}>
      <label className={styles.label}>Обложка</label>

      <div className={styles.fileUpload}>
        <input
          id="cover"
          type="file"
          className={styles.fileInput}
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
        />

        <label htmlFor="cover" className={styles.fileLabel}>
          {uploading ? 'Загрузка...' : 'Загрузить файл'}
        </label>

        {fileName && <div className={styles.fileName}>{fileName}</div>}
      </div>

      {preview && (
        <div className={styles.preview}>
          <Image
            src={preview}
            alt="preview"
            width={600}
            height={300}
            unoptimized
            className={styles.previewImage}
          />
        </div>
      )}
    </div>
  )
}

// ================= PAGE =================
export default function AddCourse() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  // ИЗМЕНЕНИЕ: новое состояние для iframe-кода
  const [videoEmbedCode, setVideoEmbedCode] = useState('')
  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data?.session?.user) {
        router.push('/login')
        return
      }

      setUser(data.session.user)
      setCategories(await fetchCategories())
      setLoading(false)
    }

    load()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // Обрабатываем введённый код перед отправкой
    const processedEmbedCode = extractEmbedCode(videoEmbedCode);

    const payload = {
      title,
      description,
      price: Number(price) || 0,
      category_slug: category || null,
      cover_url: coverUrl,
      // ИЗМЕНЕНИЕ: отправляем новое поле
      video_embed_code: processedEmbedCode,
      author_id: user.id,
      status: 'published',
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/create-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const text = await res.text()
      const result = text ? JSON.parse(text) : null

      if (!res.ok) {
        alert(result?.error || 'Ошибка создания курса')
        return
      }

      router.push('/catalog')
    } catch (err) {
      console.error(err)
      alert('Сервер не ответил')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <>
      <Head>
        <title>Создание курса</title>
      </Head>

      <div className={styles.header}>
        <h1 className={styles.title}>Создание курса</h1>
        <p className={styles.subtitle}>Заполни информацию о новом курсе</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Название</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Цена</label>
            <input
              type="number"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Категория</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Выбрать</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label className={styles.label}>Описание</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <ImageUploader
            onUploadComplete={setCoverUrl}
            disabled={submitting}
          />

          {/* ИЗМЕНЕНИЕ: Заменяем поле для URL на поле для iframe-кода */}
          <div className={styles.formGroupFull}>
            <label className={styles.label}>
              Код видео (iframe) с RuTube
              <span className={styles.hint}>
                {' '}— скопируйте из «Поделиться» → «Код вставки плеера»
              </span>
            </label>
            <textarea
              className={styles.textarea}
              value={videoEmbedCode}
              onChange={(e) => setVideoEmbedCode(e.target.value)}
              placeholder="Пример: <iframe src='https://rutube.ru/play/embed/VIDEO_ID' ...></iframe>"
              rows={4}
            />
            <p className={styles.helpText}>
              Можно вставить либо полный код iframe, либо только ссылку из src. Система автоматически её извлечёт.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.back()}
          >
            Отмена
          </button>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Публикация...' : 'Опубликовать курс'}
          </button>
        </div>
      </form>
    </>
  )
}