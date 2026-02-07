import { getServiceSupabase } from '../../../lib/supabaseServer'
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    const { courseId, userId } = req.body || {}
    
    // Валидация входных данных
    if (!courseId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Не указан ID курса' 
      })
    }
    
    if (!userId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Не указан ID пользователя' 
      })
    }

    const supabase = getServiceSupabase()

    // 1. Получаем информацию о курсе
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, author_id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Курс не найден' 
      })
    }

    // 2. Проверяем, не куплен ли уже курс
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existingPurchase) {
      return res.status(409).json({ 
        ok: false, 
        error: 'Вы уже приобрели этот курс' 
      })
    }

    // 3. Создаем запись о покупке
    const purchaseData = {
      user_id: userId,
      course_id: courseId,
      amount: course.price || 0,
      status: 'paid',
      payment_method: 'mock',
      payment_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert([purchaseData])
      .select()
      .single()

    if (purchaseError) {
      console.error('[API pay/mock] Purchase creation error:', purchaseError)
      return res.status(500).json({ 
        ok: false, 
        error: 'Ошибка при создании записи о покупке' 
      })
    }

    // 4. Возвращаем успешный ответ с информацией
    return res.status(200).json({
      ok: true,
      data: {
        purchaseId: purchase.id,
        courseTitle: course.title,
        amount: course.price,
        redirect: `/payment/success?purchaseId=${purchase.id}&courseId=${courseId}`
      },
      message: 'Покупка успешно завершена'
    })

  } catch (error) {
    console.error('[API pay/mock] Unexpected error:', error)
    return res.status(500).json({ 
      ok: false, 
      error: 'Внутренняя ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}