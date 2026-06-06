import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.first_name) errs.first_name = 'First name is required'
    if (!form.last_name) errs.last_name = 'Last name is required'
    return errs
  }

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setErrors({ ...errors, [field]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      await register(form.email, form.password, form.first_name, form.last_name)
      navigate('/', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const fieldErrors = {}
        Object.entries(data).forEach(([key, msgs]) => {
          fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ form: 'Registration failed. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (field) =>
    errors[field] ? <span style={fieldErrorStyle}>{errors[field]}</span> : null

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Create Account</h2>

        {errors.form && <div style={errorStyle}>{errors.form}</div>}

        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ ...labelStyle, flex: 1 }}>
            First Name
            <input
              type="text"
              value={form.first_name}
              onChange={handleChange('first_name')}
              style={inputStyle}
            />
            {fieldError('first_name')}
          </label>

          <label style={{ ...labelStyle, flex: 1 }}>
            Last Name
            <input
              type="text"
              value={form.last_name}
              onChange={handleChange('last_name')}
              style={inputStyle}
            />
            {fieldError('last_name')}
          </label>
        </div>

        <label style={labelStyle}>
          Email
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            style={inputStyle}
          />
          {fieldError('email')}
        </label>

        <label style={labelStyle}>
          Password
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            style={inputStyle}
          />
          {fieldError('password')}
        </label>

        <label style={labelStyle}>
          Confirm Password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            style={inputStyle}
          />
          {fieldError('confirmPassword')}
        </label>

        <button type="submit" disabled={submitting} style={submitStyle}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#e94560' }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 64px)',
  padding: 24,
}

const formStyle = {
  width: '100%',
  maxWidth: 440,
  padding: 32,
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
  borderRadius: 4,
  fontSize: 16,
  boxSizing: 'border-box',
}

const submitStyle = {
  width: '100%',
  padding: '12px 24px',
  background: '#e94560',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
}

const errorStyle = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: '12px',
  borderRadius: 4,
  marginBottom: 16,
  fontSize: 14,
  textAlign: 'center',
}

const fieldErrorStyle = {
  color: '#dc2626',
  fontSize: 12,
  marginTop: 2,
  display: 'block',
}
