import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/hotels?search=${encodeURIComponent(search)}`)
  }

  return (
    <div>
      <section style={heroStyle}>
        <h1 style={{ fontSize: 48, margin: 0 }}>Find your perfect stay</h1>
        <p style={{ fontSize: 18, margin: '16px 0 32px', opacity: 0.9 }}>
          Browse hotels, check availability, and book instantly
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 500 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city or hotel name..."
            style={{
              flex: 1,
              padding: '14px 18px',
              fontSize: 16,
              border: 'none',
              borderRadius: 8,
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px 28px',
              background: '#e94560',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>
      </section>

      <section style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {features.map((f) => (
            <div key={f.title} style={cardStyle}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '🏨',
    title: 'Browse Hotels',
    description: 'Search and explore hotels by name, city, or country.',
  },
  {
    icon: '📅',
    title: 'Check Availability',
    description: 'Select your dates and see real-time room availability and prices.',
  },
  {
    icon: '✅',
    title: 'Book Instantly',
    description: 'Complete your reservation in minutes — no account required.',
  },
]

const heroStyle = {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  color: '#fff',
  textAlign: 'center',
  padding: '80px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const cardStyle = {
  background: '#fff',
  padding: 32,
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  textAlign: 'center',
}
