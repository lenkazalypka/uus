export const mockCategories = [
  { id: 'c1', slug: 'risovanie', name: 'Рисование' },
  { id: 'c2', slug: 'vyazanie', name: 'Вязание' },
  { id: 'c3', slug: 'biser', name: 'Бисероплетение' },
  { id: 'c4', slug: 'makrame', name: 'Макраме' },
  { id: 'c5', slug: 'lepka', name: 'Лепка' },
]

export const mockCourses = [
  {
    id: 'k1',
    title: 'Акварель: первые заливки без боли',
    description: 'Быстрый старт в акварели: материалы, заливки, градиенты, ошибки новичков.',
    category: 'Рисование',
    category_slug: 'risovanie',
    price: 1490,
    cover:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/1hHMwLxN6EM',
    isPremium: true,
  },
  {
    id: 'k2',
    title: 'Макраме: стильная подвеска для кашпо',
    description: 'Узлы, натяжение, схема. Сделаешь изделие за вечер, без “ой всё”.',
    category: 'Макраме',
    category_slug: 'makrame',
    price: 990,
    cover:
      'https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    isPremium: false,
  },
  {
    id: 'k3',
    title: 'Бисер: браслет “Северное сияние”',
    description: 'Подбор цветов, натяжение, застёжка. Идеально для первых продаж.',
    category: 'Бисероплетение',
    category_slug: 'biser',
    price: 1290,
    cover:
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    isPremium: true,
  },
  {
    id: 'k4',
    title: 'Вязание: шарф за 2 вечера',
    description: 'Ровные края, петли, плотность. Супер понятный старт.',
    category: 'Вязание',
    category_slug: 'vyazanie',
    price: 890,
    cover:
      'https://images.unsplash.com/photo-1542315192-1f61a8f1a1a0?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/2OEL4P1Rz04',
    isPremium: false,
  },
  {
    id: 'k5',
    title: 'Лепка: мини-скульптура из полимерки',
    description: 'Формы, текстуры, обжиг и лак. Уровень: “я смогу”.',
    category: 'Лепка',
    category_slug: 'lepka',
    price: 1590,
    cover:
      'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    isPremium: false,
  },
  {
    id: 'k6',
    title: 'Рисование: скетчинг маркерами',
    description: 'Свет/тень, палитра, контуры. Быстро, ярко, красиво.',
    category: 'Рисование',
    category_slug: 'risovanie',
    price: 1390,
    cover:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    isPremium: true,
  },
]
