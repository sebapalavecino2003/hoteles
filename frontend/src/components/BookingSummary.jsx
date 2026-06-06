export default function BookingSummary({ hotel, roomType, checkIn, checkOut, totalPrice }) {
  const nights = calcNights(checkIn, checkOut)

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 16px' }}>Booking Summary</h3>

      <div style={rowStyle}>
        <span style={labelStyle}>Hotel</span>
        <span>{hotel?.name || '-'}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Room Type</span>
        <span>{roomType?.name || '-'}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Check-in</span>
        <span>{checkIn || '-'}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Check-out</span>
        <span>{checkOut || '-'}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Nights</span>
        <span>{nights}</span>
      </div>

      <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <div style={{ ...rowStyle, fontWeight: 700, fontSize: 16 }}>
        <span>Total</span>
        <span>${totalPrice?.toFixed(2) || '-'}</span>
      </div>
    </div>
  )
}

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const d1 = new Date(checkIn)
  const d2 = new Date(checkOut)
  return Math.max(0, (d2 - d1) / (1000 * 60 * 60 * 24))
}

const cardStyle = {
  background: '#fff',
  padding: 24,
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
}

const labelStyle = {
  color: '#666',
}
