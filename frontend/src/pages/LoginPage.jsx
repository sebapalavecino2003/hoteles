import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      navigate(searchParams.get('returnUrl') || '/', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invalid email or password. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Login</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <label style={labelStyle}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <button type="submit" disabled={submitting} style={submitStyle}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: '#e94560' }}>
            Register
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
  maxWidth: 400,
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
