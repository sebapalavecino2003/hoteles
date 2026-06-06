export default function DateRangePicker({ checkIn, checkOut, onCheckInChange, onCheckOutChange }) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <label style={labelStyle}>
        Check-in
        <input
          type="date"
          value={checkIn}
          onChange={(e) => onCheckInChange(e.target.value)}
          min={today}
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Check-out
        <input
          type="date"
          value={checkOut}
          onChange={(e) => onCheckOutChange(e.target.value)}
          min={checkIn || today}
          style={inputStyle}
        />
      </label>

      {checkIn && checkOut && checkOut <= checkIn && (
        <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
          Check-out must be after check-in
        </p>
      )}
    </div>
  )
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  fontWeight: 500,
  color: '#333',
  gap: 4,
}

const inputStyle = {
  padding: '10px 14px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 15,
}
