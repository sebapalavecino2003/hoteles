import { useState, useEffect } from 'react'
import { getEmployeeDashboard } from '../../api/client'

const cards = [
  { key: 'total_room_types', label: 'Room Types', icon: '🛏️' },
  { key: 'total_rooms', label: 'Rooms', icon: '🚪' },
  { key: 'total_reservations', label: 'Total Reservations', icon: '📋' },
  { key: 'pending_reservations', label: 'Pending', icon: '⏳' },
  { key: 'confirmed_reservations', label: 'Confirmed', icon: '✅' },
]

export default function EmployeeDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getEmployeeDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#666' }}>Loading dashboard...</p>
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>

  return (
    <div>
      <h2 style={{ margin: '0 0 8px' }}>{data?.hotel_name}</h2>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Dashboard</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {cards.map(({ key, label, icon }) => (
          <div key={key} style={cardStyle}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{data?.[key] ?? 0}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle = {
  background: '#fff',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  textAlign: 'center',
}
