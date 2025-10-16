import { useState, useEffect, useRef } from 'react'

const DataVisualization = ({ data, type = 'bar', title, height = 300 }) => {
  const canvasRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height })

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const width = canvasRef.current.parentElement.clientWidth
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [height])

  useEffect(() => {
    if (canvasRef.current && dimensions.width > 0) {
      drawChart()
    }
  }, [data, type, dimensions])

  const drawChart = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)
    
    if (!data || data.length === 0) {
      drawNoData(ctx)
      return
    }

    switch (type) {
      case 'bar':
        drawBarChart(ctx)
        break
      case 'line':
        drawLineChart(ctx)
        break
      case 'pie':
        drawPieChart(ctx)
        break
      default:
        drawBarChart(ctx)
    }
  }

  const drawNoData = (ctx) => {
    ctx.fillStyle = '#4B5563'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('No data available', dimensions.width / 2, dimensions.height / 2)
  }

  const drawBarChart = (ctx) => {
    const padding = 40
    const chartWidth = dimensions.width - padding * 2
    const chartHeight = dimensions.height - padding * 2
    
    const maxValue = Math.max(...data.map(d => d.value))
    const barWidth = chartWidth / data.length * 0.8
    const barSpacing = chartWidth / data.length * 0.2

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight
      const x = padding + index * (barWidth + barSpacing)
      const y = dimensions.height - padding - barHeight

      ctx.fillStyle = '#64FFDA'
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw label
      ctx.fillStyle = '#F8FAFC'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.label, x + barWidth / 2, dimensions.height - padding + 20)

      // Draw value
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)
    })

    // Draw axes
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, dimensions.height - padding)
    ctx.lineTo(dimensions.width - padding, dimensions.height - padding)
    ctx.stroke()
  }

  const drawLineChart = (ctx) => {
    const padding = 40
    const chartWidth = dimensions.width - padding * 2
    const chartHeight = dimensions.height - padding * 2
    
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))

    ctx.strokeStyle = '#64FFDA'
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = dimensions.height - padding - ((item.value - minValue) / (maxValue - minValue)) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw points
    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = dimensions.height - padding - ((item.value - minValue) / (maxValue - minValue)) * chartHeight

      ctx.fillStyle = '#64FFDA'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const drawPieChart = (ctx) => {
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const radius = Math.min(dimensions.width, dimensions.height) / 2 - 40

    const total = data.reduce((sum, item) => sum + item.value, 0)
    let startAngle = 0

    data.forEach((item, index) => {
      const sliceAngle = (2 * Math.PI * item.value) / total
      
      ctx.fillStyle = getColor(index)
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const labelAngle = startAngle + sliceAngle / 2
      const labelX = centerX + (radius + 20) * Math.cos(labelAngle)
      const labelY = centerY + (radius + 20) * Math.sin(labelAngle)

      ctx.fillStyle = '#F8FAFC'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(item.label, labelX, labelY)

      startAngle += sliceAngle
    })
  }

  const getColor = (index) => {
    const colors = ['#64FFDA', '#4FD1C5', '#38B2AC', '#319795', '#2C7A7B']
    return colors[index % colors.length]
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
        />
      </div>

      {data && data.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getColor(index) }}
              />
              <span className="text-gray-300 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataVisualization