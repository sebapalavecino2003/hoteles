import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HotelLandingPage from './pages/HotelLandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookingPage from './pages/BookingPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHotels from './pages/admin/AdminHotels'
import AdminEmployees from './pages/admin/AdminEmployees'
import AdminReservations from './pages/admin/AdminReservations'
import EmployeeLayout from './components/EmployeeLayout'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeRoomTypes from './pages/employee/EmployeeRoomTypes'
import EmployeeRooms from './pages/employee/EmployeeRooms'
import EmployeeReservations from './pages/employee/EmployeeReservations'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<HotelLandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="reservations" element={<AdminReservations />} />
          </Route>

          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="room-types" element={<EmployeeRoomTypes />} />
            <Route path="rooms" element={<EmployeeRooms />} />
            <Route path="reservations" element={<EmployeeReservations />} />
          </Route>
        </Routes>
      </main>
    </AuthProvider>
  )
}
