// components/PostImageUpload.js
import { useState } from 'react'

export default function PostImageUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Максимум 10MB для бесплатного тарифа
    if (file.size > 10 * 1024 * 1024) {
      alert('Максимальный размер 10MB')
      return
    }

    // Создаем превью
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Начинаем загрузку
    setUploading(true)

    try {
      // 1. Получаем upload URL
      const sessionResponse = await fetch('https://postimages.org/json/rr')
      const sessionData = await sessionResponse.json()

      if (!sessionData.upload_url) {
        throw new Error('Не удалось получить URL для загрузки')
      }

      // 2. Подготавливаем FormData
      const formData = new FormData()
      formData.append('token', sessionData.token || '')
      formData.append('optsize', '1200x630') // Размер для обложек курсов
      formData.append('expire', '0') // 0 = никогда не удалять
      formData.append('numfiles', '1')
      formData.append('upload_session', sessionData.upload_session || '')
      formData.append('file', file)

      // 3. Загружаем файл
      const uploadResponse = await fetch(sessionData.upload_url, {
        method: 'POST',
        body: formData,
      })

      const uploadResult = await uploadResponse.json()

      if (uploadResult.status !== 'OK') {
        throw new Error(uploadResult.error || 'Ошибка загрузки')
      }

      // 4. Получаем URL картинки
      const imageUrl = uploadResult.url
      setUploadedUrl(imageUrl)

      // 5. Сообщаем родительскому компоненту
      if (onUploadComplete) {
        onUploadComplete(imageUrl)
      }

      console.log('✅ Изображение загружено:', imageUrl)
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error)
      alert(`Ошибка: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setPreview('')
    setUploadedUrl('')
  }

  return (
    <div
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      {!preview ? (
        <>
          <label
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#0070f3',
              color: 'white',
              borderRadius: '8px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1,
              fontSize: '16px',
            }}
          >
            {uploading ? '🔄 Загрузка...' : '📸 Загрузить обложку'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>

          {uploading && (
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: '#e9ecef',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '70%',
                    height: '100%',
                    background: '#51cf66',
                    animation: 'loading 1.5s ease-in-out infinite',
                  }}
                ></div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Загружаем на postimages.org...
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt="Превью обложки"
              style={{
                width: '100%',
                maxHeight: '250px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />

            {uploadedUrl && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(81, 207, 102, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                ✓ Загружено
              </div>
            )}
          </div>

          <div
            style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}
          >
            <button
              onClick={() => {
                if (uploadedUrl) {
                  navigator.clipboard.writeText(uploadedUrl)
                  alert('Ссылка скопирована!')
                }
              }}
              style={{
                padding: '8px 16px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              📋 Копировать ссылку
            </button>

            <button
              onClick={resetUpload}
              style={{
                padding: '8px 16px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🗑️ Удалить
            </button>
          </div>

          {uploadedUrl && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px',
                background: '#e7f5ff',
                borderRadius: '6px',
                fontSize: '12px',
                wordBreak: 'break-all',
              }}
            >
              <strong>Ссылка:</strong>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1971c2', marginLeft: '5px' }}
              >
                {uploadedUrl.substring(0, 50)}...
              </a>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  )
}
