import { useState, useEffect } from 'react'
import { getAdminEmployees, createAdminEmployee, getAdminHotels } from '../../api/client'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', hotel_id: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchData = () => {
    setLoading(true)
    Promise.all([getAdminEmployees(), getAdminHotels()])
      .then(([emps, hts]) => { setEmployees(emps); setHotels(hts) })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const resetForm = () => { setForm({ email: '', password: '', first_name: '', last_name: '', hotel_id: '' }); setShowForm(false); setMsg('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await createAdminEmployee({ ...form, hotel_id: Number(form.hotel_id) })
      setMsg('Employee created')
      resetForm()
      fetchData()
    } catch (err) {
      const data = err.response?.data
      if (data?.email) setMsg(data.email[0] || data.email)
      else setMsg(data?.detail || 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ color: '#666' }}>Loading employees...</p>
  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Employees</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} style={btnStyle}>
          {showForm ? 'Cancel' : 'Create Employee'}
        </button>
      </div>

      {msg && <div style={msgContainer(msg)}>{msg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={labelStyle}>
              Email
              <input type="email" value={form.email} onChange={handleChange('email')} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Password
              <input type="password" value={form.password} onChange={handleChange('password')} required style={inputStyle} />
            </label>
            <label style={labelStyle}>
              First Name
              <input type="text" value={form.first_name} onChange={handleChange('first_name')} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Last Name
              <input type="text" value={form.last_name} onChange={handleChange('last_name')} style={inputStyle} />
            </label>
            <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
              Hotel
              <select value={form.hotel_id} onChange={handleChange('hotel_id')} required style={inputStyle}>
                <option value="">Select hotel</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" disabled={saving} style={submitBtnStyle}>
            {saving ? 'Creating...' : 'Create Employee'}
          </button>
        </form>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Hotel ID</th>
            <th style={thStyle}>Active</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const hotel = hotels.find((h) => h.id === emp.hotel_id)
            return (
              <tr key={emp.id}>
                <td style={tdStyle}>{emp.email}</td>
                <td style={tdStyle}>{emp.first_name} {emp.last_name}</td>
                <td style={tdStyle}>{hotel ? `${hotel.name} (ID: ${emp.hotel_id})` : emp.hotel_id}</td>
                <td style={tdStyle}>
                  <span style={{ color: emp.is_active ? '#16a34a' : '#dc2626', fontSize: 13 }}>
                    {emp.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const btnStyle = { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }
const msgContainer = (msg) => ({
  background: msg.includes('fail') ? '#fef2f2' : '#f0fdf4',
  color: msg.includes('fail') ? '#dc2626' : '#16a34a',
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
