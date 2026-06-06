import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getHotelReservations, updateReservationStatus } from '../../api/client'

const statuses = ['', 'pending_payment', 'confirmed', 'completed', 'cancelled']
const labels = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function EmployeeReservations() {
  const { user } = useAuth()
  const hotelId = user?.hotel_id
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [actionMsg, setActionMsg] = useState('')

  const fetchReservations = () => {
    if (!hotelId) return
    setLoading(true)
    getHotelReservations(hotelId, filter || undefined)
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load reservations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReservations() }, [hotelId, filter])

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'cancelled' && !window.confirm('Cancel this reservation?')) return
    setActionMsg('')
    try {
      await updateReservationStatus(id, newStatus)
      setActionMsg(`Status changed to ${newStatus}`)
      fetchReservations()
    } catch (err) {
      setActionMsg(err.response?.data?.detail || 'Failed to change status')
    }
  }

  const statusActions = (r) => {
    const s = r.status
    const actions = []
    if (s === 'pending_payment') {
      actions.push({ label: 'Confirm', status: 'confirmed', color: '#16a34a' })
      actions.push({ label: 'Cancel', status: 'cancelled', color: '#dc2626' })
    } else if (s === 'confirmed') {
      actions.push({ label: 'Complete', status: 'completed', color: '#2563eb' })
      actions.push({ label: 'Cancel', status: 'cancelled', color: '#dc2626' })
    } else if (s === 'cancelled') {
      actions.push({ label: 'Re-confirm', status: 'confirmed', color: '#16a34a' })
    }
    return actions
  }

  if (!hotelId) return <p style={{ color: '#666' }}>No hotel assigned.</p>
  if (loading) return <p style={{ color: '#666' }}>Loading reservations...</p>
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>

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

      {actionMsg && (
        <div style={{
          background: actionMsg.includes('fail') ? '#fef2f2' : '#f0fdf4',
          color: actionMsg.includes('fail') ? '#dc2626' : '#16a34a',
          padding: 10,
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14,
        }}>
          {actionMsg}
        </div>
      )}

      {reservations.length === 0 && <p style={{ color: '#666' }}>No reservations found.</p>}

      {reservations.map((r) => (
        <div key={r.id} style={cardStyle}>
          <div
            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <strong>#{r.id}</strong> — {r.room_type_name}
              <span style={{ color: '#666', marginLeft: 12, fontSize: 13 }}>{[r.guest_first_name, r.guest_last_name].filter(Boolean).join(' ') || r.guest_email || '-'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={statusBadge(r.status)}>{r.status}</span>
              <span style={{ fontSize: 14, color: '#666' }}>
                {r.check_in} → {r.check_out}
              </span>
            </div>
          </div>

          {expandedId === r.id && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #eee' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14, marginBottom: 16 }}>
                <div><strong>Guest:</strong> {r.guest_first_name} {r.guest_last_name}</div>
                <div><strong>Email:</strong> {r.guest_email}</div>
                <div><strong>Phone:</strong> {r.guest_phone || '-'}</div>
                <div><strong>DNI:</strong> {r.guest_dni || '-'}</div>
                <div><strong>Total:</strong> ${Number(r.total_price).toFixed(2)}</div>
                <div><strong>Created:</strong> {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {statusActions(r).map((a) => (
                  <button
                    key={a.status}
                    onClick={() => handleStatusChange(r.id, a.status)}
                    style={{
                      padding: '8px 16px',
                      background: a.color,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
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

const cardStyle = {
  background: '#fff',
  padding: 16,
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: 12,
}
