import { supabase } from './supabaseClient'

// 🔧 Вспомогательная функция для нормализации categorySlug
const normalizeCategorySlug = (slug) => {
  if (!slug) return null
  if (typeof slug === 'string' && (slug === 'null' || slug === 'undefined' || slug === '')) {
    return null
  }
  return slug
}

// 🔧 Вспомогательная функция для безопасного получения пользователя
const getCurrentUser = async () => {
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session?.user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/* ================== CATEGORIES ================== */
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('title', { ascending: true })

    if (error) {
      console.error('[API] fetchCategories error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('[API] fetchCategories unexpected error:', error)
    return []
  }
}

/* ================== COURSES ================== */
export const fetchCourses = async (categorySlug = null, limit = null) => {
  try {
    const normalizedSlug = normalizeCategorySlug(categorySlug)
    
    let query = supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (normalizedSlug) {
      query = query.eq('category_slug', normalizedSlug)
    }
    
    if (limit && limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('[API] fetchCourses error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('[API] fetchCourses unexpected error:', error)
    return []
  }
}

/* ================== SINGLE COURSE ================== */
export const fetchCourseById = async (id) => {
  try {
    if (!id) {
      console.warn('[API] fetchCourseById: no id provided')
      return null
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('[API] fetchCourseById error:', error)
      return null
    }
    
    if (data && data.category_slug) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', data.category_slug)
        .maybeSingle()
      
      return { ...data, categories: categoryData ? [categoryData] : [] }
    }
    
    return data || null
  } catch (error) {
    console.error('[API] fetchCourseById unexpected error:', error)
    return null
  }
}

/* ================== LIKED COURSES ================== */
export const fetchLikedCourses = async (userId) => {
  try {
    if (!userId) {
      console.warn('[API] fetchLikedCourses: no userId provided')
      return []
    }

    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('course_id')
      .eq('user_id', userId)

    if (likesError) {
      console.error('[API] fetchLikedCourses likes error:', likesError)
      return []
    }

    if (!likes || likes.length === 0) {
      return []
    }

    const courseIds = likes.map(like => like.course_id)

    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('id', courseIds)

    if (coursesError) {
      console.error('[API] fetchLikedCourses courses error:', coursesError)
      return []
    }

    const coursesWithLikeFlag = (courses || []).map(course => ({
      ...course,
      isLiked: true
    }))

    return coursesWithLikeFlag
  } catch (error) {
    console.error('[API] fetchLikedCourses unexpected error:', error)
    return []
  }
}

/* ================== PURCHASED COURSES (ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ) ================== */
export const fetchPurchasedCourses = async (userId) => {
  try {
    if (!userId) {
      console.warn('[API] fetchPurchasedCourses: no userId provided')
      return []
    }

    // 1. Получаем все покупки пользователя (ТОЛЬКО существующие колонки!)
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('course_id, created_at') // ← Убрали status и amount
      .eq('user_id', userId)

    if (purchasesError) {
      console.error('[API] fetchPurchasedCourses purchases error:', purchasesError)
      return []
    }

    if (!purchases || purchases.length === 0) {
      return []
    }

    // 2. Извлекаем ID курсов
    const courseIds = purchases.map(p => p.course_id)

    // 3. Получаем полную информацию о курсах
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('id', courseIds)

    if (coursesError) {
      console.error('[API] fetchPurchasedCourses courses error:', coursesError)
      return []
    }

    // 4. Объединяем данные о покупке и курсе
    const purchasedCourses = (courses || []).map(course => {
      const purchase = purchases.find(p => p.course_id === course.id)
      return {
        ...course,
        purchased_at: purchase?.created_at
      }
    })

    return purchasedCourses
  } catch (error) {
    console.error('[API] fetchPurchasedCourses unexpected error:', error)
    return []
  }
}

/* ================== CHECK IF PURCHASED ================== */
export const checkIfPurchased = async (userId, courseId) => {
  try {
    if (!userId || !courseId) {
      console.warn('[API] checkIfPurchased: missing userId or courseId')
      return false
    }

    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('[API] checkIfPurchased error:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('[API] checkIfPurchased unexpected error:', error)
    return false
  }
}

/* ================== TOGGLE LIKE ================== */
export const toggleLike = async (courseId, isLiked) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.warn('[API] toggleLike: user not authenticated')
      return false
    }

    const userId = user.id

    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId)

      if (error) {
        console.error('[API] toggleLike (delete) error:', error)
        return false
      }
      return true
    } else {
      const { error } = await supabase
        .from('likes')
        .insert([{ 
          user_id: userId, 
          course_id: courseId,
          created_at: new Date().toISOString()
        }])

      if (error) {
        if (error.code === '23505') {
          return true
        }
        console.error('[API] toggleLike (insert) error:', error)
        return false
      }
      return true
    }
  } catch (error) {
    console.error('[API] toggleLike unexpected error:', error)
    return false
  }
}

/* ================== CREATE PURCHASE (ИСПРАВЛЕННАЯ) ================== */
export const createPurchase = async (userId, courseId, amount = 0) => {
  try {
    if (!userId || !courseId) {
      console.warn('[API] createPurchase: missing userId or courseId')
      return { success: false, error: 'Missing required fields' }
    }

    const alreadyPurchased = await checkIfPurchased(userId, courseId)
    if (alreadyPurchased) {
      return { 
        success: false, 
        error: 'Курс уже приобретен',
        alreadyPurchased: true 
      }
    }

    const { data, error } = await supabase
      .from('purchases')
      .insert([{ 
        user_id: userId, 
        course_id: courseId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { 
          success: true, 
          message: 'Покупка уже была оформлена ранее',
          data: null 
        }
      }
      console.error('[API] createPurchase error:', error)
      return { 
        success: false, 
        error: error.message || 'Ошибка при создании покупки' 
      }
    }

    return { 
      success: true, 
      data,
      message: 'Покупка успешно оформлена'
    }
  } catch (error) {
    console.error('[API] createPurchase unexpected error:', error)
    return { 
      success: false, 
      error: 'Внутренняя ошибка сервера' 
    }
  }
}

/* ================== GET USER PROFILE ================== */
export const getUserProfile = async (userId) => {
  try {
    if (!userId) return null
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('[API] getUserProfile error:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('[API] getUserProfile unexpected error:', error)
    return null
  }
}

/* ================== SEARCH COURSES ================== */
export const searchCourses = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return await fetchCourses()
    }
    
    const term = `%${searchTerm}%`
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .or(`title.ilike.${term},description.ilike.${term}`)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[API] searchCourses error:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('[API] searchCourses unexpected error:', error)
    return []
  }
}