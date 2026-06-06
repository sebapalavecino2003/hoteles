import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ConfirmationPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user, isAuthenticated, register } = useAuth()

  const [reservation, setReservation] = useState(location.state?.reservation || null)
  const [registerEmail, setRegisterEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regDone, setRegDone] = useState(false)

  // Try to restore from sessionStorage if refreshed
  useEffect(() => {
    if (!reservation) {
      try {
        const stored = sessionStorage.getItem(`reservation_${id}`)
        if (stored) setReservation(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [id, reservation])

  const hotelName = location.state?.hotel || reservation?.hotel_name || ''
  const roomTypeName = location.state?.roomType || reservation?.room_type_name || ''

  const handleRegister = async (e) => {
    e.preventDefault()
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match')
      return
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters')
      return
    }

    setRegSubmitting(true)
    setRegError('')

    try {
      const email = registerEmail || reservation?.guest_email || ''
      if (!email) {
        setRegError('Email is required')
        setRegSubmitting(false)
        return
      }
      await register(email, regPassword, '', '')
      setRegDone(true)
    } catch (err) {
      const data = err.response?.data
      if (data?.email) setRegError(data.email[0] || 'Email already registered. Try logging in.')
      else if (data?.password) setRegError(data.password[0])
      else setRegError('Registration failed. Please try again.')
    } finally {
      setRegSubmitting(false)
    }
  }

  if (!reservation) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
        <p>Reservation details not available.</p>
        <p>
          <Link to="/" style={{ color: '#e94560' }}>Back to Home</Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>✅</div>
        <h2 style={{ textAlign: 'center', margin: '0 0 4px' }}>Booking Confirmed!</h2>
        <p style={{ textAlign: 'center', color: '#666', margin: '0 0 24px' }}>
          Reservation #{reservation.id}
        </p>

        <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <div style={rowStyle}>
            <span style={labelStyle}>Hotel</span>
            <span>{hotelName}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Room Type</span>
            <span>{roomTypeName}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Check-in</span>
            <span>{reservation.check_in}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Check-out</span>
            <span>{reservation.check_out}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Status</span>
            <span style={statusStyle}>{reservation.status}</span>
          </div>
          <div style={{ ...rowStyle, fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span>${Number(reservation.total_price).toFixed(2)}</span>
          </div>
        </div>

        <p style={{ ...infoBoxStyle }}>
          Your booking is pending payment. Please complete payment at the hotel within 24 hours.
        </p>
      </div>

      {!isAuthenticated && !regDone && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 8px' }}>Create an Account</h3>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
            Manage your reservation and future bookings.
          </p>

          {regError && <div style={errorStyle}>{regError}</div>}

          <form onSubmit={handleRegister}>
            <label style={labelStyle}>
              Email
              <input
                type="email"
                value={registerEmail || reservation.guest_email || ''}
                onChange={(e) => setRegisterEmail(e.target.value)}
                style={inputStyle}
                readOnly={!!reservation.guest_email}
              />
            </label>
            <label style={labelStyle}>
              Password
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
            <label style={labelStyle}>
              Confirm Password
              <input
                type="password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
            <button type="submit" disabled={regSubmitting} style={submitBtnStyle}>
              {regSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#e94560' }}>Login</Link>
          </p>
        </div>
      )}

      {regDone && (
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <p style={{ color: '#16a34a', fontWeight: 600 }}>Account created! You are now logged in.</p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link to="/" style={{ color: '#e94560' }}>Back to Home</Link>
      </div>
    </div>
  )
}

const cardStyle = {
  background: '#fff',
  padding: 32,
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  marginBottom: 24,
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 0',
}

const labelStyle = {
  color: '#666',
}

const statusStyle = {
  background: '#fef9c3',
  color: '#a16207',
  padding: '2px 10px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 500,
}

const infoBoxStyle = {
  background: '#f0f9ff',
  color: '#0369a1',
  padding: 12,
  borderRadius: 8,
  fontSize: 14,
  textAlign: 'center',
  margin: 0,
}

const errorStyle = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: '10px',
  borderRadius: 6,
  marginBottom: 12,
  fontSize: 13,
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginTop: 4,
  marginBottom: 12,
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 15,
  boxSizing: 'border-box',
}

const submitBtnStyle = {
  width: '100%',
  padding: '12px 24px',
  background: '#1a1a2e',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}
