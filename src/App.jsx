import React, { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Line } from 'react-konva'
import { useGesture } from '@use-gesture/react'
import { saveAs } from 'file-saver'

function Candle({ x, open, high, low, close, width = 20, priceToY, onDragEnd, onClick, isSelected, bullColor, bearColor }) {
  const isBull = close >= open
  const bodyTop = priceToY(Math.max(open, close))
  const bodyBottom = priceToY(Math.min(open, close))
  const bodyHeight = bodyBottom - bodyTop
  const color = isBull ? bullColor : bearColor
  const strokeColor = isSelected ? '#ffff00' : color
  const strokeWidth = isSelected ? 4 : 1

  const wickX = x + width / 2

  return (
    <>
      <Line
        points={[wickX, priceToY(high), wickX, priceToY(low)]}
        stroke={strokeColor}
        strokeWidth={strokeWidth + 1}
      />
      <Rect
        x={x}
        y={bodyTop}
        width={width}
        height={Math.max(bodyHeight, 1)}
        fill={color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        draggable
        onDragEnd={onDragEnd}
        onClick={onClick}
        onTap={onClick}
      />
    </>
  )
}

// === MÀN HÌNH ĐĂNG NHẬP ===
function LoginScreen({ onLoginSuccess }) {
  const [selectedUser, setSelectedUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const suggestedUsers = [
    'TraderPro',
    'PriceAction',
    'CandleMaster',
    'ChartWizard',
    'BullBear',
    'ForexKing',
    'CryptoQueen',
    'SwingTrader',
    'DayTraderVN',
    'ScalperX'
  ]

  const requiredUsername = 'PriceAction'
  const correctPasswordHash = 'enhjdmJubW1uYnZjeHo=' // btoa('zxcvbnmmnbvcxz')

  const handleLogin = () => {
    setError('')

    if (!selectedUser) {
      setError('Vui lòng chọn tên người dùng')
      return
    }

    if (selectedUser !== requiredUsername) {
      setError('Tên người dùng không hợp lệ!')
      return
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    if (btoa(password) === correctPasswordHash) {
      onLoginSuccess()
    } else {
      setError('Mật khẩu không đúng!')
    }
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: '#222',
        padding: '40px 50px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        minWidth: '360px',
        textAlign: 'center',
        border: '1px solid #444',
      }}>
        <h1 style={{ margin: '0 0 30px 0', fontSize: '32px', color: '#00bcd4' }}>
          CandleCreator
        </h1>
        <p style={{ marginBottom: '30px', color: '#aaa' }}>
          Vui lòng đăng nhập để tiếp tục
        </p>

        <div style={{ marginBottom: '20px' }}>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #555',
              background: '#333',
              color: '#fff',
            }}
          >
            <option value="">-- Chọn tên người dùng --</option>
            {suggestedUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid #555',
              background: '#333',
              color: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#ff5252', margin: '10px 0 20px 0', fontWeight: 'bold' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: '#00bcd4',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => e.target.style.background = '#00acc1'}
          onMouseOut={(e) => e.target.style.background = '#00bcd4'}
        >
          Đăng nhập
        </button>


      </div>
    </div>
  )
}

// === APP CHÍNH ===
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [candles, setCandles] = useState([])
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 50, y: 0 })
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [editValues, setEditValues] = useState({ open: 100, high: 110, low: 90, close: 105 })
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const [chartBgColor, setChartBgColor] = useState('#000000')
  const [bullColor, setBullColor] = useState('#26a69a')
  const [bearColor, setBearColor] = useState('#ef5350')

  const stageRef = useRef()
  const stageContainerRef = useRef()
  const headerRef = useRef()
  const fileInputRef = useRef()

  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateSize = () => {
      const headerHeight = headerRef.current?.offsetHeight || 180
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight - headerHeight,
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const addCandle = (type) => {
    let openPrice

    if (candles.length > 0) {
      openPrice = candles[candles.length - 1].close
    } else {
      openPrice = 100 + Math.random() * 50
    }

    const variation = 10 + Math.random() * 20
    const close = type === 'bull'
      ? openPrice + variation
      : openPrice - variation

    const high = Math.max(openPrice, close) + Math.random() * 8
    const low = Math.min(openPrice, close) - Math.random() * 8

    setCandles([...candles, { open: openPrice, high, low, close }])
    setSelectedIndex(null)
    setIsPanelOpen(false)
  }

  const handleDragEnd = (e, index) => {
    const deltaY = e.target.y() / scale
    e.target.y(0)
    setCandles(candles.map((c, i) =>
      i === index
        ? {
          open: c.open - deltaY,
          high: c.high - deltaY,
          low: c.low - deltaY,
          close: c.close - deltaY,
        }
        : c
    ))
  }

  const handleCandleClick = (index) => {
    const candle = candles[index]
    setSelectedIndex(index)
    setEditValues({ ...candle })
    setIsPanelOpen(true)
  }

  const updateCandle = () => {
    if (selectedIndex === null) return

    const valid = {
      open: editValues.open,
      close: editValues.close,
      high: Math.max(editValues.high, Math.max(editValues.open, editValues.close)),
      low: Math.min(editValues.low, Math.min(editValues.open, editValues.close)),
    }

    setCandles(candles.map((c, i) => (i === selectedIndex ? valid : c)))
    setEditValues(valid)
  }

  const closePanel = () => {
    setSelectedIndex(null)
    setIsPanelOpen(false)
  }

  const resetZoom = () => {
    setScale(1)
    setOffset({ x: 50, y: 0 })
  }

  // === HÀM MỚI: Thiết kế lại (xóa hết + reset màu) ===
  const clearAllCandles = () => {
    if (window.confirm('Bạn có chắc muốn xóa sạch tất cả các nến không?\nHành động này không thể hoàn tác.')) {
      setCandles([])
      setSelectedIndex(null)
      setIsPanelOpen(false)

      // Reset màu về mặc định
      setChartBgColor('#000000')
      setBullColor('#26a69a')
      setBearColor('#ef5350')

      alert('Đã xóa sạch biểu đồ và reset màu sắc về mặc định! Bạn có thể bắt đầu thiết kế lại từ đầu.')
    }
  }

  const bind = useGesture({
    onDrag: ({ offset: [dx, dy] }) => {
      if (window.altKey) {
        setOffset({ x: offset.x + dx, y: offset.y + dy })
      }
    },
    onWheel: ({ delta: [, dy] }) => {
      setScale(prev => Math.max(0.2, Math.min(3, prev - dy * 0.001)))
    },
  })

  const saveData = () => {
    const data = {
      candles,
      chartBgColor,
      bullColor,
      bearColor,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    saveAs(blob, 'candles-data.json')
  }

  const openData = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.candles && Array.isArray(data.candles)) {
          setCandles(data.candles)
          if (data.chartBgColor) setChartBgColor(data.chartBgColor)
          if (data.bullColor) setBullColor(data.bullColor)
          if (data.bearColor) setBearColor(data.bearColor)
          setSelectedIndex(null)
          setIsPanelOpen(false)
          alert('Đã tải dữ liệu thành công!')
        } else {
          alert('File không hợp lệ!')
        }
      } catch (err) {
        alert('Lỗi đọc file: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const exportPNG = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 })
    saveAs(uri, 'chart.png')
  }

  const priceToY = (price) => {
    const allPrices = candles.length > 0 ? candles.flatMap(c => [c.high, c.low]) : [200, 0]
    const maxPrice = Math.max(...allPrices, 200)
    const minPrice = Math.min(...allPrices, 0)
    const range = maxPrice - minPrice || 100
    const paddedRange = range * 1.2
    const centerPrice = (maxPrice + minPrice) / 2
    return ((centerPrice - price) / paddedRange) * stageSize.height + stageSize.height / 2
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#111',
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        ref={headerRef}
        style={{
          background: '#222',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <h1 style={{ margin: '0 0 15px 0' }}>CandleCreator</h1>

        {/* Dòng chính: Zoom bên trái - Buttons ở giữa - Màu bên phải */}
        <div style={{
          margin: '15px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          {/* Bên trái: Nút Zoom */}
          <button
            onClick={resetZoom}
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              padding: '12px 30px',
              background: '#444',
              color: '#fff',
              border: '2px solid #666',
              borderRadius: '10px',
              cursor: 'pointer',
              minWidth: '120px',
              marginLeft: '20px',
            }}
            onMouseOver={(e) => e.target.style.background = '#555'}
            onMouseOut={(e) => e.target.style.background = '#444'}
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Giữa: Các button chức năng */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            flex: '1',
          }}>
            <button onClick={() => addCandle('bull')} style={btnStyle}>🟢 Add Bull</button>
            <button onClick={() => addCandle('bear')} style={btnStyle}>🔴 Add Bear</button>
            <button onClick={saveData} style={btnStyle}>💾 Save Data</button>
            <button onClick={openData} style={btnStyle}>📂 Open Data</button>
            <button onClick={exportPNG} style={btnStyle}>🖼️ Export PNG</button>
            <button
              onClick={clearAllCandles}
              style={{ ...btnStyle, background: '#b71c1c' }}
              onMouseOver={(e) => e.target.style.background = '#c62828'}
              onMouseOut={(e) => e.target.style.background = '#b71c1c'}
            >
              🔄 Thiết kế lại
            </button>
          </div>

          {/* Bên phải: Các ô chọn màu */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            marginRight: '20px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Nền biểu đồ</label>
              <input
                type="color"
                value={chartBgColor}
                onChange={(e) => setChartBgColor(e.target.value)}
                style={{ width: '60px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Nến tăng</label>
              <input
                type="color"
                value={bullColor}
                onChange={(e) => setBullColor(e.target.value)}
                style={{ width: '60px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Nến giảm</label>
              <input
                type="color"
                value={bearColor}
                onChange={(e) => setBearColor(e.target.value)}
                style={{ width: '60px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={stageContainerRef}
        {...bind()}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: window.altKey ? 'move' : 'default',
          background: chartBgColor,
        }}
      >
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={offset.x}
          y={offset.y}
          ref={stageRef}
        >
          <Layer>
            {candles.map((c, i) => {
              const candleX = 100 + i * 34
              return (
                <Candle
                  key={i}
                  x={candleX}
                  open={c.open}
                  high={c.high}
                  low={c.low}
                  close={c.close}
                  priceToY={priceToY}
                  onDragEnd={(e) => handleDragEnd(e, i)}
                  onClick={() => handleCandleClick(i)}
                  isSelected={selectedIndex === i}
                  bullColor={bullColor}
                  bearColor={bearColor}
                />
              )
            })}
          </Layer>
        </Stage>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileChange}
        />

        <div
          id="edit-panel"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'linear-gradient(to top, #1e1e1e, #252525)',
            borderTop: '3px solid #444',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.8)',
            transition: 'transform 0.3s ease-out',
            transform: isPanelOpen ? 'translateY(0)' : 'translateY(100%)',
            zIndex: 1000,
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>
              Edit Candle {selectedIndex !== null ? selectedIndex + 1 : ''}
            </h3>
            <button
              onClick={closePanel}
              style={{
                background: 'none',
                border: 'none',
                color: '#aaa',
                fontSize: '32px',
                cursor: 'pointer',
                lineHeight: '1',
                padding: '0 10px',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
            <div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#00bcd4', fontSize: '16px', fontWeight: 'bold' }}>
                  OPEN: <strong style={{ color: '#fff' }}>{editValues.open?.toFixed(2)}</strong>
                </label>
                <input type="range" min="0" max="300" step="0.1" value={editValues.open || 100}
                  onChange={(e) => setEditValues(prev => ({ ...prev, open: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle} style={sliderStyle} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50', fontSize: '16px', fontWeight: 'bold' }}>
                  HIGH: <strong style={{ color: '#fff' }}>{editValues.high?.toFixed(2)}</strong>
                </label>
                <input type="range" min="0" max="300" step="0.1" value={editValues.high || 100}
                  onChange={(e) => setEditValues(prev => ({ ...prev, high: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle} style={sliderStyle} />
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ff5722', fontSize: '16px', fontWeight: 'bold' }}>
                  LOW: <strong style={{ color: '#fff' }}>{editValues.low?.toFixed(2)}</strong>
                </label>
                <input type="range" min="0" max="300" step="0.1" value={editValues.low || 100}
                  onChange={(e) => setEditValues(prev => ({ ...prev, low: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle} style={sliderStyle} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e91e63', fontSize: '16px', fontWeight: 'bold' }}>
                  CLOSE: <strong style={{ color: '#fff' }}>{editValues.close?.toFixed(2)}</strong>
                </label>
                <input type="range" min="0" max="300" step="0.1" value={editValues.close || 100}
                  onChange={(e) => setEditValues(prev => ({ ...prev, close: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle} style={sliderStyle} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const btnStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
  background: '#444',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
}

const sliderStyle = {
  width: '100%',
  height: '12px',
  borderRadius: '6px',
  background: '#444',
  outline: 'none',
  appearance: 'none',
}

export default App