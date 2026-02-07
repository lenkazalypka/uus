import { getServiceSupabase } from '../../lib/supabaseClient'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id, course_id } = req.body || {}
  if (!user_id || !course_id) return res.status(400).json({ error: 'Missing fields' })

  const svc = getServiceSupabase()

  try {
    const { data, error } = await svc
      .from('purchases')
      .insert([{ user_id, course_id }])
      .select()
      .single()

    if (error) {
      console.error('create-purchase error', error)
      return res.status(500).json({ error: error.message || 'Insert failed' })
    }
    return res.status(200).json({ data })
  } catch (err) {
    console.error('create-purchase unexpected', err)
    return res.status(500).json({ error: err.message || 'Unexpected' })
  }
}
