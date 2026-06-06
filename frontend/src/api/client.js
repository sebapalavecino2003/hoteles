import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const { data } = await axios.post('/api/auth/refresh/', {
          refresh: refreshToken,
        })

        localStorage.setItem('accessToken', data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return apiClient(originalRequest)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export async function searchHotels(query) {
  const params = query ? { search: query } : {}
  const { data } = await apiClient.get('/public/hotels/', { params })
  return data
}

export async function getHotelDetail(hotelId) {
  const { data } = await apiClient.get(`/public/hotels/${hotelId}/`)
  return data
}

export async function getRoomType(hotelId, roomTypeId) {
  const hotel = await getHotelDetail(hotelId)
  const rt = hotel.room_types?.find((r) => r.id === Number(roomTypeId))
  return rt || null
}

// Admin API
export async function getAdminDashboard() {
  const { data } = await apiClient.get('/admin/dashboard/')
  return data
}

export async function getAdminEmployees() {
  const { data } = await apiClient.get('/admin/employees/')
  return data
}

export async function createAdminEmployee(data) {
  const { data: result } = await apiClient.post('/admin/employees/', data)
  return result
}

export async function getAdminReservations(status) {
  const params = status ? { status } : {}
  const { data } = await apiClient.get('/admin/reservations/', { params })
  return data
}

export async function getAdminHotels() {
  const { data } = await apiClient.get('/hotels/')
  return Array.isArray(data) ? data : data.results || []
}

export async function createAdminHotel(data) {
  const { data: result } = await apiClient.post('/hotels/', data)
  return result
}

export async function updateAdminHotel(id, data) {
  const { data: result } = await apiClient.put(`/hotels/${id}/`, data)
  return result
}

export async function deactivateHotel(id) {
  const { data } = await apiClient.delete(`/hotels/${id}/`)
  return data
}

// Employee API
export async function getEmployeeDashboard() {
  const { data } = await apiClient.get('/employee/dashboard/')
  return data
}

export async function getHotelRoomTypes(hotelId) {
  const { data } = await apiClient.get(`/hotels/${hotelId}/room-types/`)
  return data
}

export async function createRoomType(hotelId, data) {
  const { data: result } = await apiClient.post(`/hotels/${hotelId}/room-types/`, data)
  return result
}

export async function updateRoomType(hotelId, id, data) {
  const { data: result } = await apiClient.put(`/hotels/${hotelId}/room-types/${id}/`, data)
  return result
}

export async function deleteRoomType(hotelId, id) {
  await apiClient.delete(`/hotels/${hotelId}/room-types/${id}/`)
}

export async function getRooms(hotelId, roomTypeId) {
  const { data } = await apiClient.get(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms/`)
  return data
}

export async function createRoom(hotelId, roomTypeId, data) {
  const { data: result } = await apiClient.post(`/hotels/${hotelId}/room-types/${roomTypeId}/rooms/`, data)
  return result
}

export async function updateRoom(hotelId, roomId, data) {
  const { data: result } = await apiClient.put(`/hotels/${hotelId}/rooms/${roomId}/`, data)
  return result
}

export async function deleteRoom(hotelId, roomId) {
  await apiClient.delete(`/hotels/${hotelId}/rooms/${roomId}/`)
}

export async function getHotelReservations(hotelId, status) {
  const params = status ? { status } : {}
  const { data } = await apiClient.get(`/hotels/${hotelId}/reservations/`, { params })
  return data
}

export async function updateReservationStatus(reservationId, status) {
  const { data } = await apiClient.put(`/employee/reservations/${reservationId}/status/`, { status })
  return data
}

export async function createReservation(data) {
  const { data: result } = await apiClient.post('/reservations/', data)
  return result
}

export async function getReservation(id) {
  const { data } = await apiClient.get(`/reservations/${id}/`)
  return data
}

export async function getAvailability(hotelId, checkIn, checkOut) {
  const { data } = await apiClient.get(
    `/public/hotels/${hotelId}/availability/`,
    { params: { check_in: checkIn, check_out: checkOut } },
  )
  return data
}

export default apiClient

