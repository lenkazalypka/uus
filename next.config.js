/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'storage.yandexcloud.net',
      'images.unsplash.com',
      'your-bucket-name.storage.yandexcloud.net',
      'your-project.supabase.co',
    ],
  },
}

module.exports = nextConfig
