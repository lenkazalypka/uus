import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fileName, fileType, bucketName = 'your-bucket-name' } = req.body

    // ✅ РАБОЧАЯ КОНФИГУРАЦИЯ для Yandex Cloud
    const s3Client = new S3Client({
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
      forcePathStyle: true,
      // Ключевое отличие: используем явную передачу credentials
      credentials: {
        accessKeyId: process.env.YC_ACCESS_KEY_ID.trim(),
        secretAccessKey: process.env.YC_SECRET_ACCESS_KEY.trim(),
      },
      // Отключаем STS и другие AWS-специфичные проверки
      useArnRegion: false,
      disableHostPrefix: true,
      // Важно для S3-совместимых хранилищ
      tls: true,
      // Отключаем проверку региона для не-AWS эндпоинтов
      customUserAgent: 'uus-online/1.0',
    })

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      ContentType: fileType,
      Metadata: {
        'x-amz-meta-uploaded-by': 'uus-online-platform',
      },
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900,
      // Явно указываем регион для подписи
      signableHeaders: new Set(['host']),
    })

    res.status(200).json({
      url: signedUrl,
      key: command.input.Key,
      bucket: bucketName,
    })
  } catch (error) {
    console.error('Full error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Дополнительная диагностика
      envKeys: {
        accessKeyLength: process.env.YC_ACCESS_KEY_ID?.length,
        secretKeyLength: process.env.YC_SECRET_ACCESS_KEY?.length,
      },
    })

    res.status(500).json({
      error: 'Failed to generate presigned URL',
      details: error.message,
      code: error.name,
    })
  }
}
