import { useState, useEffect } from 'react'
import { getAdminHotels, createAdminHotel, updateAdminHotel, deactivateHotel } from '../../api/client'

const emptyForm = { name: '', description: '', address: '', city: '', country: '', phone: '', email: '' }

export default function AdminHotels() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchHotels = () => {
    setLoading(true)
    getAdminHotels()
      .then(setHotels)
      .catch(() => setError('Failed to load hotels'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchHotels() }, [])

  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const resetForm = () => { setForm(emptyForm); setShowForm(false); setEditId(null); setMsg('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      if (editId) {
        await updateAdminHotel(editId, form)
        setMsg('Hotel updated')
      } else {
        await createAdminHotel(form)
        setMsg('Hotel created')
      }
      resetForm()
      fetchHotels()
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (h) => {
    setForm({ name: h.name, description: h.description || '', address: h.address || '', city: h.city || '', country: h.country || '', phone: h.phone || '', email: h.email || '' })
    setEditId(h.id)
    setShowForm(true)
    setMsg('')
  }

  const handleDeactivate = async (h) => {
    if (!window.confirm(`Deactivate ${h.name}?`)) return
    try {
      await deactivateHotel(h.id)
      fetchHotels()
    } catch {
      setMsg('Failed to deactivate')
    }
  }

  if (loading) return <p style={{ color: '#666' }}>Loading hotels...</p>
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Hotels</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} style={btnStyle}>
          {showForm ? 'Cancel' : 'Create Hotel'}
        </button>
      </div>

      {msg && <div style={msgStyle}>{msg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['name', 'city', 'country', 'phone', 'email', 'address'].map((f) => (
              <label key={f} style={labelStyle}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <input
                  type={f === 'email' ? 'email' : 'text'}
                  value={form[f]}
                  onChange={handleChange(f)}
                  required={f === 'name'}
                  style={inputStyle}
                />
              </label>
            ))}
            <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
              Description
              <textarea value={form.description} onChange={handleChange('description')} style={{ ...inputStyle, minHeight: 60 }} />
            </label>
          </div>
          <button type="submit" disabled={saving} style={submitBtnStyle}>
            {saving ? 'Saving...' : editId ? 'Update Hotel' : 'Create Hotel'}
          </button>
        </form>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>City</th>
            <th style={thStyle}>Country</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((h) => (
            <tr key={h.id}>
              <td style={tdStyle}>{h.name}</td>
              <td style={tdStyle}>{h.city}</td>
              <td style={tdStyle}>{h.country}</td>
              <td style={tdStyle}>
                <span style={{ color: h.is_active ? '#16a34a' : '#dc2626', fontSize: 13 }}>
                  {h.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={tdStyle}>
                <button onClick={() => startEdit(h)} style={actionBtnStyle}>Edit</button>
                {h.is_active && (
                  <button onClick={() => handleDeactivate(h)} style={{ ...actionBtnStyle, color: '#dc2626' }}>Deactivate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }
const msgStyle = { background: '#f0fdf4', color: '#16a34a', padding: 10, borderRadius: 6, marginBottom: 16, fontSize: 14 }
const formContainerStyle = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#333' }
const inputStyle = { width: '100%', padding: '8px 10px', marginTop: 4, border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }
const submitBtnStyle = { ...btnStyle, marginTop: 16, background: '#e94560' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const thStyle = { textAlign: 'left', padding: '12px 16px', background: '#f9fafb', fontSize: 13, fontWeight: 600, color: '#666', borderBottom: '2px solid #eee' }
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14 }
const actionBtnStyle = { padding: '4px 12px', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, marginRight: 8 }
