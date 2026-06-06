import { useState, useEffect } from 'react'
import { getAdminReservations } from '../../api/client'

const statuses = ['', 'pending_payment', 'confirmed', 'completed', 'cancelled']
const labels = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    getAdminReservations(filter || undefined)
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load reservations'))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div>
      <h2 style={{ margin: '0 0 24px' }}>Reservations</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {statuses.map((s, i) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px',
              border: '1px solid #ddd',
              borderRadius: 20,
              background: filter === s ? '#1a1a2e' : '#fff',
              color: filter === s ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {labels[i]}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#666' }}>Loading reservations...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && !error && reservations.length === 0 && (
        <p style={{ color: '#666' }}>No reservations found.</p>
      )}

      {!loading && !error && reservations.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Hotel</th>
              <th style={thStyle}>Room Type</th>
              <th style={thStyle}>Guest Email</th>
              <th style={thStyle}>Check-in</th>
              <th style={thStyle}>Check-out</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>{r.id}</td>
                <td style={tdStyle}>{r.hotel_name}</td>
                <td style={tdStyle}>{r.room_type_name}</td>
                <td style={tdStyle}>{r.guest_email || '-'}</td>
                <td style={tdStyle}>{r.check_in}</td>
                <td style={tdStyle}>{r.check_out}</td>
                <td style={tdStyle}>
                  <span style={statusBadge(r.status)}>{r.status}</span>
                </td>
                <td style={tdStyle}>${Number(r.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const statusBadge = (status) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 500,
  background:
    status === 'confirmed' ? '#dcfce7' :
    status === 'completed' ? '#dbeafe' :
    status === 'cancelled' ? '#fef2f2' :
    '#fef9c3',
  color:
    status === 'confirmed' ? '#16a34a' :
    status === 'completed' ? '#2563eb' :
    status === 'cancelled' ? '#dc2626' :
    '#a16207',
})

const tableStyle = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const thStyle = { textAlign: 'left', padding: '12px 16px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#666', borderBottom: '2px solid #eee' }
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14 }
