import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { toggleLike } from '../lib/api'
import styles from '../styles/CourseCard.module.css'

const CourseCard = ({ course, onLikeToggle, showCategory = false }) => {
  const [isLiked, setIsLiked] = useState(!!course?.isLiked)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLiked(!!course?.isLiked)
  }, [course?.isLiked])

  const handleLikeClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return
    
    setIsLoading(true)
    const success = await toggleLike(course.id, isLiked)
    
    if (success) {
      const newState = !isLiked
      setIsLiked(newState)
      if (onLikeToggle) onLikeToggle(course.id, newState)
    } else {
      console.error('Не удалось обновить избранное')
      // Можно добавить toast уведомление вместо alert
    }
    
    setIsLoading(false)
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Бесплатно'
    return `${price.toLocaleString('ru-RU')} ₽`
  }

  // Ключевое исправление: правильное обрезание текста
  const getTruncatedDescription = (text, maxLength = 100) => {
    if (!text) return ''
    
    const trimmed = text.trim()
    if (trimmed.length <= maxLength) {
      return trimmed // Не добавляем многоточие если текст короткий
    }
    
    // Обрезаем до последнего полного слова
    const truncated = trimmed.substr(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    if (lastSpace > 0) {
      return truncated.substr(0, lastSpace) + '...'
    }
    
    return truncated + '...'
  }

  return (
    <article className={`${styles.card} lift-on-hover`}>
      <Link href={`/course/${course.id}`} className={styles.coverWrap}>
        <div className={styles.coverContainer}>
          <img 
            src={course.cover_url || '/placeholder.jpg'} 
            alt={course.title}
            className={styles.cover}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = '/placeholder.jpg'
            }}
          />
          {course.category_slug && showCategory && (
            <span className={styles.categoryBadge}>
              {course.category_name || course.category_slug}
            </span>
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.title} title={course.title}>
            {course.title}
          </h3>
          <button
            className={`${styles.like} ${isLiked ? styles.liked : ''} ${isLoading ? styles.loading : ''}`}
            onClick={handleLikeClick}
            disabled={isLoading}
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Убрать из избранного' : 'Добавить в избранное'}
            title={isLiked ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isLoading && (
              <span className={styles.spinner} aria-hidden="true"></span>
            )}
          </button>
        </div>

        {/* ИСПРАВЛЕННОЕ ОТОБРАЖЕНИЕ ОПИСАНИЯ */}
        <p className={styles.description}>
          {getTruncatedDescription(course.description, 100)}
        </p>
        
        <div className={styles.meta}>
          <span className={`${styles.price} ${!course.price ? styles.free : ''}`}>
            {formatPrice(course.price)}
          </span>
          
          {course.rating !== undefined && (
            <div className={styles.rating}>
              <span className={styles.stars}>★</span>
              <span>{course.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {course.author_name && (
          <div className={styles.author}>
            <span>Автор: {course.author_name}</span>
          </div>
        )}
      </div>
    </article>
  )
}

// Добавляем CSS для новых элементов (можно добавить в CourseCard.module.css)
const additionalStyles = `
  .categoryBadge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .free {
    color: #28a745;
    font-weight: 600;
  }
  
  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #ffc107;
    font-weight: 500;
  }
  
  .stars {
    color: #ffc107;
  }
  
  .loading {
    opacity: 0.7;
    cursor: wait;
  }
  
  .spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(0,0,0,.1);
    border-radius: 50%;
    border-top-color: currentColor;
    animation: spin 1s linear infinite;
    margin-left: 4px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

export default CourseCard