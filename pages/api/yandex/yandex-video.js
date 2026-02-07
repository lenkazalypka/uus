import AWS from 'aws-sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const s3 = new AWS.S3({
  accessKeyId: process.env.YANDEX_ACCESS_KEY,
  secretAccessKey: process.env.YANDEX_SECRET_KEY,
  endpoint: process.env.YANDEX_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'ru-central1',
})

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace(/^Bearer\s*/i, '')
    if (!token) return res.status(401).json({ error: 'Missing authorization token' })

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    const user = userData?.user
    if (userErr || !user) return res.status(401).json({ error: 'Invalid token or user not found' })

    const { videoId } = req.query
    if (!videoId) return res.status(400).json({ error: 'Missing videoId' })

    const { data: video, error: videoErr } = await supabase
      .from('videos')
      .select('object_key')
      .eq('id', videoId)
      .single()

    if (videoErr || !video) return res.status(404).json({ error: 'Video not found' })

    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.YANDEX_BUCKET,
      Key: video.object_key,
      Expires: 600, // 10 minutes
    })

    return res.status(200).json({ url })
  } catch (err) {
    // Server-side logging is useful; remove if you want no-console warnings
    console.error('yandex-video handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
