import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getHotelRoomTypes, createRoomType, updateRoomType, deleteRoomType } from '../../api/client'

const emptyForm = { name: '', description: '', max_guests: 2, price_per_night: '' }

export default function EmployeeRoomTypes() {
  const { user } = useAuth()
  const hotelId = user?.hotel_id
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchData = () => {
    if (!hotelId) return
    setLoading(true)
    getHotelRoomTypes(hotelId)
      .then(setRoomTypes)
      .catch(() => setError('Failed to load room types'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [hotelId])

  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditId(null); setMsg('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const payload = { ...form, max_guests: Number(form.max_guests), price_per_night: Number(form.price_per_night) }
      if (editId) {
        await updateRoomType(hotelId, editId, payload)
        setMsg('Room type updated')
      } else {
        await createRoomType(hotelId, payload)
        setMsg('Room type created')
      }
      resetForm()
      fetchData()
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (rt) => {
    setForm({ name: rt.name, description: rt.description || '', max_guests: rt.max_guests, price_per_night: rt.price_per_night })
    setEditId(rt.id)
    setShowForm(true)
    setMsg('')
  }

  const handleDelete = async (rt) => {
    if (!window.confirm(`Delete "${rt.name}"?`)) return
    try {
      await deleteRoomType(hotelId, rt.id)
      fetchData()
    } catch {
      setMsg('Failed to delete. Room type may have rooms assigned.')
    }
  }

  if (loading) return <p style={{ color: '#666' }}>Loading room types...</p>
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Room Types</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} style={btnStyle}>
          {showForm ? 'Cancel' : 'Create Room Type'}
        </button>
      </div>

      {msg && <div style={msgStyle(msg)}>{msg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={labelStyle}>
              Name
              <input type="text" value={form.name} onChange={handleChange('name')} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Max Guests
              <input type="number" value={form.max_guests} onChange={handleChange('max_guests')} min={1} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Price per Night ($)
              <input type="number" value={form.price_per_night} onChange={handleChange('price_per_night')} min={0} step="0.01" required style={inputStyle} />
            </label>
            <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
              Description
              <textarea value={form.description} onChange={handleChange('description')} style={{ ...inputStyle, minHeight: 60 }} />
            </label>
          </div>
          <button type="submit" disabled={saving} style={submitBtnStyle}>
            {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Max Guests</th>
            <th style={thStyle}>Price/Night</th>
            <th style={thStyle}>Active</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roomTypes.map((rt) => (
            <tr key={rt.id}>
              <td style={tdStyle}>{rt.name}</td>
              <td style={tdStyle}>{rt.max_guests}</td>
              <td style={tdStyle}>${Number(rt.price_per_night).toFixed(2)}</td>
              <td style={tdStyle}>
                <span style={{ color: rt.is_active ? '#16a34a' : '#dc2626', fontSize: 13 }}>
                  {rt.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={tdStyle}>
                <button onClick={() => startEdit(rt)} style={actionBtnStyle}>Edit</button>
                <button onClick={() => handleDelete(rt)} style={{ ...actionBtnStyle, color: '#dc2626' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }
const msgStyle = (msg) => ({
  background: msg.toLowerCase().includes('fail') ? '#fef2f2' : '#f0fdf4',
  color: msg.toLowerCase().includes('fail') ? '#dc2626' : '#16a34a',
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
