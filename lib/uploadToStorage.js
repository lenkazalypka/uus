export const uploadToStorage = async (file, folder) => {
  try {
    const response = await fetch('/api/yandex/presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        folder: folder,
        contentType: file.type,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get upload URL')
    }

    const { url, publicUrl } = await response.json()

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error('Upload failed')
    }

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}
