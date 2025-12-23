import React, { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Line } from 'react-konva'
import { useGesture } from '@use-gesture/react'
import { saveAs } from 'file-saver'

function Candle({ x, open, high, low, close, width = 20, priceToY, onClick, isSelected, bullColor, bearColor }) {
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
        onClick={onClick}
        onTap={onClick}
      />
    </>
  )
}

// LoginScreen giữ nguyên
function LoginScreen({ onLoginSuccess }) {
  const [selectedUser, setSelectedUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const suggestedUsers = [
    'TraderPro', 'PriceAction', 'CandleMaster', 'ChartWizard', 'BullBear',
    'ForexKing', 'CryptoQueen', 'SwingTrader', 'DayTraderVN', 'ScalperX'
  ]

  const requiredUsername = 'PriceAction'
  const correctPasswordHash = 'enhjdmJubW1uYnZjeHo=' // btoa('zxcvbnmmnbvcxz')

  const handleLogin = () => {
    setError('')
    if (!selectedUser) return setError('Vui lòng chọn tên người dùng')
    if (selectedUser !== requiredUsername) return setError('Tên người dùng không hợp lệ!')
    if (!password) return setError('Vui lòng nhập mật khẩu')
    if (btoa(password) === correctPasswordHash) onLoginSuccess()
    else setError('Mật khẩu không đúng!')
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, color: '#fff', fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: '#222', padding: '40px 50px', borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)', minWidth: '360px', textAlign: 'center',
        border: '1px solid #444',
      }}>
        <h1 style={{ margin: '0 0 30px 0', fontSize: '32px', color: '#00bcd4' }}>CandleCreator</h1>
        <p style={{ marginBottom: '30px', color: '#aaa' }}>Vui lòng đăng nhập để tiếp tục</p>

        <div style={{ marginBottom: '20px' }}>
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #555', background: '#333', color: '#fff' }}>
            <option value="">-- Chọn tên người dùng --</option>
            {suggestedUsers.map(user => <option key={user} value={user}>{user}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="password" placeholder="Nhập mật khẩu" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #555', background: '#333', color: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        {error && <p style={{ color: '#ff5252', margin: '10px 0 20px 0', fontWeight: 'bold' }}>{error}</p>}

        <button onClick={handleLogin} style={{ width: '100%', padding: '14px', fontSize: '18px', fontWeight: 'bold', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          onMouseOver={e => e.target.style.background = '#00acc1'}
          onMouseOut={e => e.target.style.background = '#00bcd4'}>
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
  const targetOffset = useRef({ x: 50, y: 0 })

  const [selectedIndex, setSelectedIndex] = useState(null)
  const [editValues, setEditValues] = useState({ open: 100, high: 110, low: 90, close: 105 })
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Thêm state cho nút ON/OFF Open
  const [allowEditOpen, setAllowEditOpen] = useState(false)

  const [chartBgColor, setChartBgColor] = useState('#000000')
  const [bullColor, setBullColor] = useState('#26a69a')
  const [bearColor, setBearColor] = useState('#ef5350')

  const stageRef = useRef()
  const stageContainerRef = useRef()
  const headerRef = useRef()
  const fileInputRef = useRef()
  const animationFrame = useRef()

  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })

  // Smooth pan animation (giữ nguyên)
  useEffect(() => {
    const animate = () => {
      setOffset(prev => {
        const dx = targetOffset.current.x - prev.x
        const dy = targetOffset.current.y - prev.y
        const easing = 0.12
        const newX = prev.x + dx * easing
        const newY = prev.y + dy * easing
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          return { x: targetOffset.current.x, y: targetOffset.current.y }
        }
        return { x: newX, y: newY }
      })
      animationFrame.current = requestAnimationFrame(animate)
    }
    animationFrame.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame.current)
  }, [])

  useEffect(() => {
    const updateSize = () => {
      const headerHeight = headerRef.current?.offsetHeight || 180
      setStageSize({ width: window.innerWidth, height: window.innerHeight - headerHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Đảm bảo tính liên tục giữa các nến
  const ensureContinuity = (newCandles) => {
    if (newCandles.length < 2) return newCandles
    const updated = [...newCandles]
    for (let i = 1; i < updated.length; i++) {
      const prevClose = updated[i - 1].close
      if (updated[i].open !== prevClose) {
        updated[i] = {
          ...updated[i],
          open: prevClose,
          high: Math.max(prevClose, updated[i].high, updated[i].close),
          low: Math.min(prevClose, updated[i].low, updated[i].close),
        }
      }
    }
    return updated
  }

  // Thêm nến mới
  const addCandle = (type) => {
    let openPrice = candles.length > 0 ? candles[candles.length - 1].close : 100 + Math.random() * 50
    const variation = 10 + Math.random() * 20
    const close = type === 'bull' ? openPrice + variation : openPrice - variation
    const high = Math.max(openPrice, close) + Math.random() * 8
    const low = Math.min(openPrice, close) - Math.random() * 8

    setCandles(prev => [...prev, { open: openPrice, high, low, close }])
    setSelectedIndex(null)
    setIsPanelOpen(false)
  }

  const handleCandleClick = (index) => {
    const candle = candles[index]
    setSelectedIndex(index)
    setEditValues({ ...candle })
    setIsPanelOpen(true)
    // Reset nút ON/OFF mỗi khi mở panel mới
    setAllowEditOpen(false)
  }

  // Hàm cập nhật nến với logic mới cho Close
  const updateCandle = () => {
    if (selectedIndex === null) return

    let valid = {
      open: editValues.open,
      close: editValues.close,
      high: Math.max(editValues.high, Math.max(editValues.open, editValues.close)),
      low: Math.min(editValues.low, Math.min(editValues.open, editValues.close)),
    }

    // Nếu Open bị disable (OFF), giữ nguyên Open cũ
    if (!allowEditOpen) {
      valid.open = candles[selectedIndex].open
    }

    let newCandles = [...candles]
    newCandles[selectedIndex] = valid

    // Nếu chỉnh Close và có nến sau, dịch chuyển toàn bộ nến sau theo delta Close
    if (selectedIndex < candles.length - 1) {
      const deltaClose = valid.close - candles[selectedIndex].close
      for (let i = selectedIndex + 1; i < newCandles.length; i++) {
        newCandles[i] = {
          open: newCandles[i].open + deltaClose,
          high: newCandles[i].high + deltaClose,
          low: newCandles[i].low + deltaClose,
          close: newCandles[i].close + deltaClose,
        }
      }
    }

    // Đảm bảo liên tục sau khi chỉnh
    newCandles = ensureContinuity(newCandles)

    setCandles(newCandles)
    setEditValues({ ...valid })
  }

  const closePanel = () => {
    setSelectedIndex(null)
    setIsPanelOpen(false)
    setAllowEditOpen(false)
  }

  // Xóa nến (giữ nguyên)
  const deleteSelectedCandle = () => {
    if (selectedIndex === null) return
    if (selectedIndex === candles.length - 1) {
      setCandles(prev => prev.filter((_, i) => i !== selectedIndex))
    } else {
      const leftClose = selectedIndex > 0 ? candles[selectedIndex - 1].close : candles[selectedIndex + 1].open
      const rightOpen = candles[selectedIndex + 1].open
      const delta = leftClose - rightOpen

      let newCandles = candles.filter((_, i) => i !== selectedIndex)
      for (let i = selectedIndex; i < newCandles.length; i++) {
        newCandles[i] = {
          open: newCandles[i].open + delta,
          high: newCandles[i].high + delta,
          low: newCandles[i].low + delta,
          close: newCandles[i].close + delta,
        }
      }
      newCandles = ensureContinuity(newCandles)
      setCandles(newCandles)
    }
    setSelectedIndex(null)
    setIsPanelOpen(false)
  }

  // Copy nến (giữ nguyên)
  const copySelectedCandle = () => {
    if (selectedIndex === null) return
    const c = candles[selectedIndex]
    const deltaHigh = c.high - c.open
    const deltaLow = c.low - c.open
    const deltaClose = c.close - c.open
    const lastClose = candles[candles.length - 1]?.close ?? c.close
    const newCandle = {
      open: lastClose,
      high: lastClose + deltaHigh,
      low: lastClose + deltaLow,
      close: lastClose + deltaClose,
    }
    setCandles(prev => [...prev, newCandle])
    setSelectedIndex(null)
    setIsPanelOpen(false)
  }

  const resetZoom = () => {
    setScale(1)
    targetOffset.current = { x: 50, y: 0 }
    setOffset({ x: 50, y: 0 })
  }

  const clearAllCandles = () => {
    if (window.confirm('Bạn có chắc muốn xóa sạch tất cả các nến không?')) {
      setCandles([])
      setSelectedIndex(null)
      setIsPanelOpen(false)
      setChartBgColor('#000000')
      setBullColor('#26a69a')
      setBearColor('#ef5350')
      alert('Đã reset biểu đồ!')
    }
  }

  const bind = useGesture({
    onDrag: ({ offset: [dx, dy], dragging, memo = offset, target }) => {
      if (target && target.closest('#edit-panel')) return memo
      if (dragging) {
        targetOffset.current = { x: memo.x + dx, y: memo.y + dy }
        return memo
      }
      return memo
    },
    onWheel: ({ delta: [, dy] }) => {
      setScale(prev => Math.max(0.2, Math.min(3, prev - dy * 0.001)))
    },
  }, {
    drag: { filterTaps: true, from: () => [offset.x, offset.y], pointer: { buttons: [1] } },
  })

  // Các hàm save/open/export (giữ nguyên)
  const saveData = () => {
    const data = { candles, chartBgColor, bullColor, bearColor }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    saveAs(blob, 'candles-data.json')
  }

  const openData = () => fileInputRef.current.click()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.candles && Array.isArray(data.candles)) {
          setCandles(ensureContinuity(data.candles))
          if (data.chartBgColor) setChartBgColor(data.chartBgColor)
          if (data.bullColor) setBullColor(data.bullColor)
          if (data.bearColor) setBearColor(data.bearColor)
          setSelectedIndex(null)
          setIsPanelOpen(false)
          alert('Đã tải dữ liệu!')
        } else alert('File không hợp lệ!')
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

  if (!isAuthenticated) return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#111', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
      <div ref={headerRef} style={{ background: '#222', color: '#fff', padding: '20px', textAlign: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
        <h1 style={{ margin: '0 0 15px 0' }}>CandleCreator</h1>
        <div style={{ margin: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <button onClick={resetZoom} style={{ fontSize: '24px', fontWeight: 'bold', padding: '12px 30px', background: '#444', color: '#fff', border: '2px solid #666', borderRadius: '10px', cursor: 'pointer', minWidth: '120px', marginLeft: '20px' }}
            onMouseOver={e => e.target.style.background = '#555'} onMouseOut={e => e.target.style.background = '#444'}>
            {Math.round(scale * 100)}%
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', flex: '1' }}>
            <button onClick={() => addCandle('bull')} style={btnStyle}>🟢 Add Bull</button>
            <button onClick={() => addCandle('bear')} style={btnStyle}>🔴 Add Bear</button>
            <button onClick={saveData} style={btnStyle}>💾 Save Data</button>
            <button onClick={openData} style={btnStyle}>📂 Open Data</button>
            <button onClick={exportPNG} style={btnStyle}>🖼️ Export PNG</button>
            <button onClick={clearAllCandles} style={{ ...btnStyle, background: '#b71c1c' }}
              onMouseOver={e => e.target.style.background = '#c62828'} onMouseOut={e => e.target.style.background = '#b71c1c'}>
              🔄 Thiết kế lại
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginRight: '20px' }}>
            <div style={{ textAlign: 'center' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Nền</label><input type="color" value={chartBgColor} onChange={e => setChartBgColor(e.target.value)} style={{ width: '60px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: '6px' }} /></div>
            <div style={{ textAlign: 'center' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Tăng</label><input type="color" value={bullColor} onChange={e => setBullColor(e.target.value)} style={{ width: '60px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: '6px' }} /></div>
            <div style={{ textAlign: 'center' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Giảm</label><input type="color" value={bearColor} onChange={e => setBearColor(e.target.value)} style={{ width: '60px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: '6px' }} /></div>
          </div>
        </div>
      </div>

      <div ref={stageContainerRef} {...bind()} style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'grab', background: chartBgColor }}
        onMouseDown={e => { if (e.button === 0) stageContainerRef.current.style.cursor = 'grabbing' }}
        onMouseUp={() => stageContainerRef.current.style.cursor = 'grab'}
        onMouseLeave={() => stageContainerRef.current.style.cursor = 'default'}>
        <Stage width={stageSize.width} height={stageSize.height} scaleX={scale} scaleY={scale} x={offset.x} y={offset.y} ref={stageRef}>
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
                  onClick={() => handleCandleClick(i)}
                  isSelected={selectedIndex === i}
                  bullColor={bullColor}
                  bearColor={bearColor}
                />
              )
            })}
          </Layer>
        </Stage>

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />

        {/* EDIT PANEL */}
        <div id="edit-panel" style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%',
          background: 'linear-gradient(to top, #1e1e1e, #252525)', borderTop: '3px solid #444',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.8)', transition: 'transform 0.3s ease-out',
          transform: isPanelOpen ? 'translateY(0)' : 'translateY(100%)', zIndex: 1000,
          padding: '20px', boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>
              Edit Candle {selectedIndex !== null ? selectedIndex + 1 : ''}
            </h3>
            <button onClick={closePanel} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '32px', cursor: 'pointer', lineHeight: '1', padding: '0 10px' }}>×</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
            <label style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>Cho phép chỉnh OPEN:</label>
            <input
              type="checkbox"
              checked={allowEditOpen}
              onChange={e => setAllowEditOpen(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ color: allowEditOpen ? '#4caf50' : '#aaa', fontSize: '14px' }}>
              {allowEditOpen ? 'Bật (kéo được)' : 'Tắt (khóa Open)'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
            <div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#00bcd4', fontSize: '16px', fontWeight: 'bold', opacity: allowEditOpen ? 1 : 0.5 }}>
                  OPEN: <strong style={{ color: '#fff' }}>{editValues.open?.toFixed(2)}</strong>
                </label>
                <input
                  type="range"
                  min="0" max="300" step="0.1" value={editValues.open || 100}
                  disabled={!allowEditOpen}
                  onChange={e => setEditValues(prev => ({ ...prev, open: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle}
                  style={{ ...sliderStyle, opacity: allowEditOpen ? 1 : 0.5, cursor: allowEditOpen ? 'pointer' : 'not-allowed' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4caf50', fontSize: '16px', fontWeight: 'bold' }}>
                  HIGH: <strong style={{ color: '#fff' }}>{editValues.high?.toFixed(2)}</strong>
                </label>
                <input type="range" min="0" max="300" step="0.1" value={editValues.high || 100}
                  onChange={e => setEditValues(prev => ({ ...prev, high: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle} style={sliderStyle} />
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#ff5722', fontSize: '16px', fontWeight: 'bold' }}>
                  LOW: <strong style={{ color: '#fff' }}>{editValues.low?.toFixed(2)}</strong>
                </label>
                <input type="range" min="0" max="300" step="0.1" value={editValues.low || 100}
                  onChange={e => setEditValues(prev => ({ ...prev, low: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle} style={sliderStyle} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e91e63', fontSize: '16px', fontWeight: 'bold' }}>
                  CLOSE: <strong style={{ color: '#fff' }}>{editValues.close?.toFixed(2)}</strong>
                </label>
                <input type="range" min="0" max="300" step="0.1" value={editValues.close || 100}
                  onChange={e => setEditValues(prev => ({ ...prev, close: parseFloat(e.target.value) }))}
                  onMouseUp={updateCandle} onTouchEnd={updateCandle} style={sliderStyle} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #444' }}>
            <button onClick={deleteSelectedCandle} disabled={selectedIndex === null} style={{ ...actionBtnStyle, background: '#d32f2f', opacity: selectedIndex !== null ? 1 : 0.5 }} title="Xoá nến">🗑️ Xoá nến</button>
            <button onClick={copySelectedCandle} disabled={selectedIndex === null} style={{ ...actionBtnStyle, background: '#1976d2', opacity: selectedIndex !== null ? 1 : 0.5 }} title="Sao chép nến">📋 Copy Nến</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const btnStyle = { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#444', color: '#fff', border: 'none', borderRadius: '6px' }
const actionBtnStyle = { padding: '12px 24px', fontSize: '16px', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', minWidth: '180px' }
const sliderStyle = { width: '100%', height: '12px', borderRadius: '6px', background: '#444', outline: 'none', appearance: 'none' }

export default App