// pages/api/toggle-like.js
import { getServiceSupabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { courseId, userId } = req.body
  if (!courseId || !userId) {
    return res.status(400).json({ error: 'Missing data' })
  }

  const supabase = getServiceSupabase()

  // проверяем есть ли лайк
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // удалить
    await supabase
      .from('likes')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', userId)

    return res.json({ liked: false })
  } else {
    // вставить
    await supabase
      .from('likes')
      .insert({
        course_id: courseId,
        user_id: userId,
      })

    return res.json({ liked: true })
  }
}