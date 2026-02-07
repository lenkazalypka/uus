import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.YANDEX_ACCESS_KEY,
  secretAccessKey: process.env.YANDEX_SECRET_KEY,
  endpoint: process.env.YANDEX_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'ru-central1',
})

export default async function handler(req, res) {
  const { fileName, type } = req.query
  if (!fileName) return res.status(400).json({ error: 'no filename' })

  const key = `videos/${Date.now()}-${fileName}`
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: process.env.YANDEX_BUCKET,
    Key: key,
    ContentType: type || 'video/mp4',
    Expires: 300,
  })

  res.status(200).json({ uploadUrl, key })
}
