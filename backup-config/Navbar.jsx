import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
}

const btnStyle = {
  ...linkStyle,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.3)',
  cursor: 'pointer',
  fontSize: 'inherit',
  fontFamily: 'inherit',
}

const hotelName = import.meta.env.VITE_HOTEL_NAME || 'Hotel'

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  return (
    <nav
      style={{
        background: '#1a1a2e',
        color: '#fff',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/" style={{ ...linkStyle, fontWeight: 'bold', fontSize: 20 }}>
          {hotelName}
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {loading ? null : isAuthenticated ? (
          <>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ ...linkStyle, background: '#e94560' }}>
                Admin
              </Link>
            )}
            {user?.role === 'employee' && (
              <Link to="/employee" style={{ ...linkStyle, background: '#0f3460' }}>
                Panel
              </Link>
            )}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              {user?.email}
            </span>
            <button onClick={logout} style={btnStyle}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link
              to="/register"
              style={{ ...linkStyle, background: '#e94560' }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
