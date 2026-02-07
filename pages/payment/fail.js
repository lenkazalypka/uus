import Layout from '../../components/Layout'
import { useRouter } from 'next/router'

export default function PaymentFail() {
  const router = useRouter()
  return (
    <Layout title="Оплата не прошла">
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 16px' }} data-animate>
        <h1 style={{ margin: 0 }}>Оплата не прошла</h1>
        <p style={{ color: 'var(--muted)', marginTop: 10 }}>
          Ничего страшного — это может быть тестовый режим или отмена.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <button className="btn" onClick={() => router.push('/catalog')}>
            Вернуться в каталог
          </button>
          <button className="btn ghost" onClick={() => router.push('/profile')}>
            Профиль
          </button>
        </div>
      </div>
    </Layout>
  )
}
