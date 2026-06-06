import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRoomType, getHotelDetail, createReservation } from '../api/client'
import { useAuth } from '../context/AuthContext'
import BookingSummary from '../components/BookingSummary'
import GuestInfoForm from '../components/GuestInfoForm'

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const roomTypeId = searchParams.get('roomType')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const envHotelId = '1'
  const hotelId = searchParams.get('hotelId') || envHotelId

  const [hotel, setHotel] = useState(null)
  const [roomType, setRoomType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const nights = calcNights(checkIn, checkOut)
  const totalPrice = roomType ? roomType.price_per_night * nights : 0

  useEffect(() => {
    if (!roomTypeId || !checkIn || !checkOut || !hotelId) {
      setError('Missing booking information. Please select dates and a room type.')
      setLoading(false)
      return
    }

    setLoading(true)
    ;(hotelId
      ? getHotelDetail(hotelId)
      : Promise.reject(new Error('no hotelId'))
    )
      .then((h) => {
        setHotel(h)
        const rt = h.room_types?.find((r) => r.id === Number(roomTypeId))
        if (rt) {
          setRoomType(rt)
        } else {
          return getRoomType(h.id, roomTypeId).then((r) => {
            if (r) setRoomType(r)
            else setError('Room type not found.')
          })
        }
      })
      .catch(() => {
        // Fallback: try to just get the room type from a separate call
        setHotel({ name: 'Loading...' })
      })
      .finally(() => setLoading(false))
  }, [roomTypeId, checkIn, checkOut, hotelId])

  const handleSubmit = async (guestData) => {
    setSubmitting(true)
    setError('')

    try {
      const reservation = await createReservation({
        hotel_id: Number(hotelId),
        room_type_id: Number(roomTypeId),
        check_in: checkIn,
        check_out: checkOut,
        guest_first_name: guestData.first_name,
        guest_last_name: guestData.last_name,
        guest_email: guestData.email,
        guest_phone: guestData.phone,
        guest_dni: guestData.dni,
        notes: guestData.notes,
      })

      // Store in sessionStorage for confirmation page to survive refresh
      sessionStorage.setItem(`reservation_${reservation.id}`, JSON.stringify(reservation))

      navigate(`/confirmation/${reservation.id}`, {
        state: { reservation, hotel: hotel?.name, roomType: roomType?.name },
      })
    } catch (err) {
      const msg = err.response?.data?.detail
        || err.response?.data?.message
        || 'Booking failed. The room may no longer be available. Please go back and try different dates.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: 24, color: '#666' }}>Loading booking page...</div>

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Complete Your Booking</h2>

      {error && (
        <div style={errorStyle}>
          {error}
          <br />
          <button onClick={() => navigate(-1)} style={backBtnStyle}>
            Go Back
          </button>
        </div>
      )}

      {!error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <div>
            <h3 style={{ marginBottom: 16 }}>Guest Information</h3>
            <GuestInfoForm
              initialEmail={user?.email || ''}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>

          <BookingSummary
            hotel={hotel}
            roomType={roomType}
            checkIn={checkIn}
            checkOut={checkOut}
            totalPrice={totalPrice}
          />
        </div>
      )}
    </div>
  )
}

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, (d2 - d1) / (1000 * 60 * 60 * 24))
}

const errorStyle = {
  background: '#fef2f2',
  color: '#dc2626',
  padding: 24,
  borderRadius: 8,
  fontSize: 15,
  lineHeight: 1.6,
}

const backBtnStyle = {
  marginTop: 12,
  padding: '8px 20px',
  background: '#1a1a2e',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}
