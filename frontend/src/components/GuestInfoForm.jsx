import { useState } from 'react'

export default function GuestInfoForm({ initialEmail, onSubmit, submitting }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: initialEmail || '',
    phone: '',
    dni: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setErrors({ ...errors, [field]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.first_name) errs.first_name = 'Required'
    if (!form.last_name) errs.last_name = 'Required'
    if (!form.email) errs.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.phone) errs.phone = 'Required'
    if (!form.dni) errs.dni = 'Required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ ...labelStyle, flex: 1 }}>
          First Name *
          <input type="text" value={form.first_name} onChange={handleChange('first_name')} style={inputStyle} />
          {errors.first_name && <span style={errStyle}>{errors.first_name}</span>}
        </label>
        <label style={{ ...labelStyle, flex: 1 }}>
          Last Name *
          <input type="text" value={form.last_name} onChange={handleChange('last_name')} style={inputStyle} />
          {errors.last_name && <span style={errStyle}>{errors.last_name}</span>}
        </label>
      </div>

      <label style={labelStyle}>
        Email *
        <input
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          style={inputStyle}
          readOnly={!!initialEmail}
        />
        {errors.email && <span style={errStyle}>{errors.email}</span>}
      </label>

      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ ...labelStyle, flex: 1 }}>
          Phone *
          <input type="tel" value={form.phone} onChange={handleChange('phone')} style={inputStyle} />
          {errors.phone && <span style={errStyle}>{errors.phone}</span>}
        </label>
        <label style={{ ...labelStyle, flex: 1 }}>
          DNI / ID *
          <input type="text" value={form.dni} onChange={handleChange('dni')} style={inputStyle} />
          {errors.dni && <span style={errStyle}>{errors.dni}</span>}
        </label>
      </div>

      <label style={labelStyle}>
        Notes (optional)
        <textarea value={form.notes} onChange={handleChange('notes')} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
      </label>

      <button type="submit" disabled={submitting} style={submitStyle}>
        {submitting ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </form>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: 16,
  fontSize: 14,
  fontWeight: 500,
  color: '#333',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginTop: 4,
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 15,
  boxSizing: 'border-box',
}

const submitStyle = {
  width: '100%',
  padding: '12px 24px',
  background: '#e94560',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
}

const errStyle = {
  color: '#dc2626',
  fontSize: 12,
  marginTop: 2,
  display: 'block',
}
