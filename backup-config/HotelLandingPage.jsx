import { useState, useEffect } from 'react'
import { getHotelDetail, getAvailability } from '../api/client'
import DateRangePicker from '../components/DateRangePicker'
import RoomTypeCard from '../components/RoomTypeCard'

const hotelId = import.meta.env.VITE_HOTEL_ID

export default function HotelLandingPage() {
  const [hotel, setHotel] = useState(null)
  const [roomTypes, setRoomTypes] = useState([])
  const [extraServices, setExtraServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [availability, setAvailability] = useState(null)
  const [availLoading, setAvailLoading] = useState(false)

  useEffect(() => {
    if (!hotelId) {
      setError('Hotel not configured. Set VITE_HOTEL_ID.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    getHotelDetail(hotelId)
      .then((data) => {
        setHotel(data.hotel || data)
        setRoomTypes(data.room_types || [])
        setExtraServices(data.extra_services || [])
      })
      .catch(() => setError('Failed to load hotel details.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn || !hotelId) {
      setAvailability(null)
      return
    }

    setAvailLoading(true)
    getAvailability(hotelId, checkIn, checkOut)
      .then((data) => setAvailability(Array.isArray(data) ? data : data.results || []))
      .catch(() => setAvailability([]))
      .finally(() => setAvailLoading(false))
  }, [checkIn, checkOut])

  if (loading) return <div style={{ padding: 24, color: '#666' }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: '#dc2626' }}>{error}</div>
  if (!hotel) return <div style={{ padding: 24, color: '#666' }}>Hotel not found.</div>

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1 style={{ margin: '0 0 8px' }}>{hotel.name}</h1>
      <p style={{ color: '#666', margin: '0 0 4px' }}>
        {hotel.address}, {hotel.city}, {hotel.country}
      </p>
      <p style={{ color: '#999', fontSize: 14, margin: '0 0 4px' }}>
        {hotel.phone} &middot; {hotel.email}
      </p>

      {hotel.description && (
        <p style={{ color: '#444', lineHeight: 1.7, marginTop: 16 }}>{hotel.description}</p>
      )}

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h2 style={{ marginBottom: 16 }}>Check Availability</h2>
      <DateRangePicker
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
      />

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h2 style={{ marginBottom: 16 }}>Room Types</h2>

      {roomTypes.length === 0 && (
        <p style={{ color: '#666' }}>No room types available for this hotel.</p>
      )}

      {availLoading && <p style={{ color: '#666' }}>Checking availability...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {roomTypes.map((rt) => {
          const availData = availability?.find((a) => a.id === rt.id)
          return (
            <RoomTypeCard
              key={rt.id}
              roomType={rt}
              availableRoomsCount={availData?.available_rooms_count ?? null}
              checkIn={checkIn}
              checkOut={checkOut}
              hotelId={hotelId}
            />
          )
        })}
      </div>

      {extraServices.length > 0 && (
        <>
          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />
          <h2 style={{ marginBottom: 16 }}>Extra Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {extraServices.map((es) => (
              <div key={es.id} style={serviceStyle}>
                <span>{es.name}</span>
                <span style={{ fontWeight: 600 }}>${es.price}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const serviceStyle = {
  background: '#fff',
  padding: '12px 16px',
  borderRadius: 8,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 14,
  color: '#444',
}
