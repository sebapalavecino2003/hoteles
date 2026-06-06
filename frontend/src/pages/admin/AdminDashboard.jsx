import { useState, useEffect } from 'react'
import { getAdminDashboard } from '../../api/client'

const cards = [
  { key: 'total_hotels', label: 'Total Hotels', icon: '🏨' },
  { key: 'total_employees', label: 'Employees', icon: '👥' },
  { key: 'total_reservations', label: 'Reservations', icon: '📋' },
  { key: 'total_pending_payments', label: 'Pending Payments', icon: '⏳' },
]

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminDashboard()
      .then(setCounts)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#666' }}>Loading dashboard...</p>
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>

  return (
    <div>
      <h2 style={{ margin: '0 0 24px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map(({ key, label, icon }) => (
          <div key={key} style={cardStyle}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{counts?.[key] ?? 0}</div>
            <div style={{ color: '#666', fontSize: 14 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  textAlign: 'center',
}
