import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/CategoryChips.module.css'

const CategoryChips = ({ categories = [], selectedCategory, onSelect }) => {
  const router = useRouter()

  const handleCategoryClick = (slug) => {
    if (onSelect) {
      // Если есть внешний обработчик
      onSelect(slug)
    } else {
      // Стандартная навигация через роутер
      if (slug === null || slug === undefined || slug === '') {
        // Ключевое исправление: убираем параметр полностью
        router.push('/catalog', undefined, { shallow: true })
      } else {
        router.push(`/catalog?category=${encodeURIComponent(slug)}`, undefined, { shallow: true })
      }
    }
  }

  // Определяем активна ли кнопка "Все"
  const isAllActive = !selectedCategory || 
                     selectedCategory === 'null' || 
                     selectedCategory === 'undefined' || 
                     selectedCategory === ''

  return (
    <div className={styles.row}>
      {/* Кнопка "Все" - теперь всегда ведет на чистый /catalog */}
      <button
        className={`${styles.chip} ${isAllActive ? styles.active : ''}`}
        onClick={() => handleCategoryClick(null)}
        aria-pressed={isAllActive}
      >
        Все
      </button>

      {/* Категории */}
      {categories.map((category) => {
        // Проверяем, активна ли категория
        const isActive = selectedCategory === category.slug || 
                        selectedCategory === category.id?.toString()
        
        return (
          <button
            key={category.id || category.slug}
            className={`${styles.chip} ${isActive ? styles.active : ''}`}
            onClick={() => handleCategoryClick(category.slug || category.id)}
            aria-pressed={isActive}
          >
            {category.title || category.name}
          </button>
        )
      })}
    </div>
  )
}

// Добавляем проверки propTypes для отладки
CategoryChips.defaultProps = {
  categories: [],
  selectedCategory: null,
}

export default CategoryChips