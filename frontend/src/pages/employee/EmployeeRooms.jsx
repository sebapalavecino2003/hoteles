import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getHotelRoomTypes, getRooms, createRoom, updateRoom, deleteRoom } from '../../api/client'

export default function EmployeeRooms() {
  const { user } = useAuth()
  const hotelId = user?.hotel_id
  const [roomTypes, setRoomTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ room_number: '', floor: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getHotelRoomTypes(hotelId).then(setRoomTypes).catch(() => {})
  }, [hotelId])

  useEffect(() => {
    if (!selectedType) { setRooms([]); return }
    setLoading(true)
    getRooms(hotelId, selectedType)
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load rooms'))
      .finally(() => setLoading(false))
  }, [hotelId, selectedType])

  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const resetForm = () => { setForm({ room_number: '', floor: '' }); setShowForm(false); setEditId(null); setMsg('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const payload = { room_number: form.room_number, floor: form.floor ? Number(form.floor) : null }
      if (editId) {
        await updateRoom(hotelId, editId, payload)
        setMsg('Room updated')
      } else {
        await createRoom(hotelId, Number(selectedType), payload)
        setMsg('Room created')
      }
      resetForm()
      const data = await getRooms(hotelId, selectedType)
      setRooms(Array.isArray(data) ? data : [])
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail || err.response?.data || 'Operation failed')
      setMsg(msg)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (r) => {
    setForm({ room_number: r.room_number, floor: r.floor || '' })
    setEditId(r.id)
    setShowForm(true)
    setMsg('')
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete room ${r.room_number}?`)) return
    try {
      await deleteRoom(hotelId, r.id)
      const data = await getRooms(hotelId, selectedType)
      setRooms(Array.isArray(data) ? data : [])
    } catch {
      setMsg('Failed to delete room')
    }
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 24px' }}>Rooms</h2>

      <label style={{ display: 'block', marginBottom: 16, fontSize: 14, fontWeight: 500, color: '#333' }}>
        Room Type
        <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); resetForm() }} style={selectStyle}>
          <option value="">Select a room type</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>{rt.name} — ${Number(rt.price_per_night).toFixed(2)}/night</option>
          ))}
        </select>
      </label>

      {!selectedType && <p style={{ color: '#666' }}>Select a room type to manage its rooms.</p>}

      {selectedType && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#666' }}>{rooms.length} room(s)</span>
            <button onClick={() => { resetForm(); setShowForm(!showForm) }} style={btnStyle}>
              {showForm ? 'Cancel' : 'Add Room'}
            </button>
          </div>

          {msg && <div style={msgStyle(msg)}>{msg}</div>}

          {showForm && (
            <form onSubmit={handleSubmit} style={formContainerStyle}>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ flex: 1, ...labelStyle }}>
                  Room Number
                  <input type="text" value={form.room_number} onChange={handleChange('room_number')} required style={inputStyle} />
                </label>
                <label style={{ flex: 1, ...labelStyle }}>
                  Floor
                  <input type="number" value={form.floor} onChange={handleChange('floor')} style={inputStyle} />
                </label>
              </div>
              <button type="submit" disabled={saving} style={submitBtnStyle}>
                {saving ? 'Saving...' : editId ? 'Update' : 'Add Room'}
              </button>
            </form>
          )}

          {loading && <p style={{ color: '#666' }}>Loading rooms...</p>}

          {!loading && rooms.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Room Number</th>
                  <th style={thStyle}>Floor</th>
                  <th style={thStyle}>Active</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td style={tdStyle}>{r.room_number}</td>
                    <td style={tdStyle}>{r.floor ?? '-'}</td>
                    <td style={tdStyle}>
                      <span style={{ color: r.is_active ? '#16a34a' : '#dc2626', fontSize: 13 }}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => startEdit(r)} style={actionBtnStyle}>Edit</button>
                      <button onClick={() => handleDelete(r)} style={{ ...actionBtnStyle, color: '#dc2626' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}

const selectStyle = { width: '100%', maxWidth: 400, padding: '10px 12px', marginTop: 4, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }
const btnStyle = { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }
const msgStyle = (msg) => ({
  background: msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') ? '#fef2f2' : '#f0fdf4',
  color: msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') ? '#dc2626' : '#16a34a',
  padding: 10,
  borderRadius: 6,
  marginBottom: 16,
  fontSize: 14,
})
const formContainerStyle = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#333' }
const inputStyle = { width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }
const submitBtnStyle = { ...btnStyle, marginTop: 16, background: '#e94560' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const thStyle = { textAlign: 'left', padding: '12px 16px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#666', borderBottom: '2px solid #eee' }
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14 }
const actionBtnStyle = { padding: '4px 12px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, marginRight: 8 }
