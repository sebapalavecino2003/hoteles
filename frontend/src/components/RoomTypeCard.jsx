import { Link } from 'react-router-dom'

export default function RoomTypeCard({ roomType, availableRoomsCount, checkIn, checkOut, hotelId }) {
  const hasAvailability = availableRoomsCount !== null && availableRoomsCount !== undefined
  const available = hasAvailability && availableRoomsCount > 0
  const noDates = !checkIn || !checkOut

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>{roomType.name}</h3>
          <p style={{ color: '#666', margin: 0, fontSize: 14 }}>{roomType.description}</p>
        </div>
        <span style={priceStyle}>
          ${roomType.price_per_night}
          <span style={{ fontSize: 12, fontWeight: 400 }}>/night</span>
        </span>
      </div>

      <p style={{ color: '#999', fontSize: 13, margin: '12px 0' }}>
        Max {roomType.max_guests} guests
      </p>

      {hasAvailability && (
        <span
          style={{
            ...badgeStyle,
            background: available ? '#dcfce7' : '#fef2f2',
            color: available ? '#16a34a' : '#dc2626',
          }}
        >
          {available ? `${availableRoomsCount} room${availableRoomsCount > 1 ? 's' : ''} available` : 'Not available'}
        </span>
      )}

      {noDates && (
        <p style={{ color: '#999', fontSize: 13, margin: '8px 0' }}>
          Select dates to check availability
        </p>
      )}

      {hasAvailability && (
        <Link
          to={
            available
              ? `/book?roomType=${roomType.id}&checkIn=${checkIn}&checkOut=${checkOut}&hotelId=${hotelId}`
              : '#'
          }
          style={{
            ...btnStyle,
            background: available ? '#e94560' : '#ccc',
            cursor: available ? 'pointer' : 'not-allowed',
            pointerEvents: available ? 'auto' : 'none',
          }}
        >
          {available ? 'Book Now' : 'Unavailable'}
        </Link>
      )}
    </div>
  )
}

const cardStyle = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
}

const priceStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: '#1a1a2e',
  whiteSpace: 'nowrap',
}

const badgeStyle = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 500,
  margin: '8px 0',
  alignSelf: 'flex-start',
}

const btnStyle = {
  display: 'block',
  textAlign: 'center',
  padding: '10px 20px',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 600,
  marginTop: 'auto',
}
