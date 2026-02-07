import { getServiceSupabase } from '../../lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  try {
    const supabase = getServiceSupabase()

    const {
      title,
      description,
      price,
      category_slug,
      cover_url,
      video_embed_code, // ← ИЗМЕНЕНО: принимаем embed-код вместо rutube_url
      author_id,
      status = 'draft',
    } = req.body

    // Улучшенная валидация
    if (!title?.trim() || !author_id) {
      return res.status(400).json({
        ok: false,
        error: 'Название курса обязательно для заполнения',
      })
    }

    // Валидация URL обложки (опционально)
    if (cover_url && !isValidUrl(cover_url)) {
      return res.status(400).json({
        ok: false,
        error: 'Некорректный URL обложки',
      })
    }

    // Обработка embed-кода
    let processedEmbedCode = video_embed_code?.trim() || null
    
    // Опционально: если пользователь вставил полный iframe, извлекаем только src
    if (processedEmbedCode && processedEmbedCode.includes('<iframe')) {
      const srcMatch = processedEmbedCode.match(/src=['"]([^'"]+)['"]/)
      if (srcMatch) {
        processedEmbedCode = srcMatch[1]  // Оставляем только URL из src
      }
    }

    // Вставка курса с улучшенной обработкой ошибок
    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          title: title.trim(),
          description: description?.trim() || '',
          price: price ? Number(price) : 0,
          category_slug: category_slug || null,
          cover_url: cover_url || null,
          video_embed_code: processedEmbedCode, // ← ИЗМЕНЕНО: сохраняем embed-код
          author_id,
          status: status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[API create-course] Supabase error:', error)
      
      // Более информативные ошибки
      let errorMessage = 'Ошибка при создании курса'
      if (error.code === '23503') errorMessage = 'Ошибка связи с базой данных'
      if (error.code === '23505') errorMessage = 'Курс с таким названием уже существует'
      if (error.code === 'PGRST204') errorMessage = 'Ошибка структуры базы. Проверьте наличие поля video_embed_code в таблице courses'
      
      return res.status(500).json({
        ok: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }

    return res.status(201).json({
      ok: true,
      data,
      message: 'Курс успешно создан'
    })
    
  } catch (err) {
    console.error('[API create-course] Unexpected error:', err)
    return res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
    })
  }
}

// Вспомогательная функция для валидации URL
function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}