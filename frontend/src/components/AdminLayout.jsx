import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const sidebarLinkStyle = {
  display: 'block',
  padding: '10px 20px',
  color: '#ccc',
  textDecoration: 'none',
  borderRadius: 6,
  marginBottom: 4,
  fontSize: 14,
}

const activeLinkStyle = {
  ...sidebarLinkStyle,
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  fontWeight: 600,
}

export default function AdminLayout() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <div style={{ padding: 24, color: '#666' }}>Loading...</div>
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <aside style={{ width: 220, background: '#1a1a2e', padding: '16px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: 20, color: '#e94560', fontWeight: 700, fontSize: 14 }}>
          Admin Panel
        </div>
        <nav>
          {[
            { to: '/admin', label: 'Dashboard' },
            { to: '/admin/hotels', label: 'Hotels' },
            { to: '/admin/employees', label: 'Employees' },
            { to: '/admin/reservations', label: 'Reservations' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              style={({ isActive }) => (isActive ? activeLinkStyle : sidebarLinkStyle)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
        <Outlet />
      </main>
    </div>
  )
}
