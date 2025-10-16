import { useState, useEffect } from 'react'
import { usePerformance } from '../hooks/usePerformance'
import Modal from './Modal'

const PerformanceMonitor = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState({})
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    if (isOpen && isMonitoring) {
      startMonitoring()
    }
  }, [isOpen, isMonitoring])

  const startMonitoring = () => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => ({
          ...prev,
          lcp: lastEntry.renderTime || lastEntry.loadTime
        }))
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          setMetrics(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime
          }))
        })
      })
      fidObserver.observe({ type: 'first-input', buffered: true })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setMetrics(prev => ({ ...prev, cls: clsValue }))
          }
        }
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })

      return () => {
        lcpObserver.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }

  const getPerformanceScore = (metric, value) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    }

    if (!value) return 'unknown'
    
    const threshold = thresholds[metric]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  const getScoreColor = (score) => {
    const colors = {
      good: 'text-green-400',
      'needs-improvement': 'text-yellow-400',
      poor: 'text-red-400',
      unknown: 'text-gray-400'
    }
    return colors[score]
  }

  const getMemoryUsage = () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  }

  const memoryUsage = getMemoryUsage()

  return (
    <>
      {/* Performance Monitor Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-32 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        aria-label="Performance Monitor"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Performance Monitor">
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isMonitoring}
                onChange={(e) => setIsMonitoring(e.target.checked)}
                className="w-4 h-4 text-accent-teal"
              />
              <span className="text-white text-sm">Enable Real-time Monitoring</span>
            </label>
            
            <button
              onClick={() => setMetrics({})}
              className="text-sm text-accent-teal hover:underline"
            >
              Clear Data
            </button>
          </div>

          {/* Core Web Vitals */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Core Web Vitals</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">LCP</div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(getPerformanceScore('lcp', metrics.lcp))}`}>
                  {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '--'}
                </div>
                <div className="text-xs text-gray-400">Largest Contentful Paint</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">FID</div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(getPerformanceScore('fid', metrics.fid))}`}>
                  {metrics.fid ? `${Math.round(metrics.fid)}ms` : '--'}
                </div>
                <div className="text-xs text-gray-400">First Input Delay</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">CLS</div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(getPerformanceScore('cls', metrics.cls))}`}>
                  {metrics.cls ? metrics.cls.toFixed(3) : '--'}
                </div>
                <div className="text-xs text-gray-400">Cumulative Layout Shift</div>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          {memoryUsage && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Memory Usage</h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Used: {memoryUsage.used} MB</span>
                  <span>Total: {memoryUsage.total} MB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-accent-teal h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(memoryUsage.used / memoryUsage.total) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {Math.round((memoryUsage.used / memoryUsage.total) * 100)}% of available memory
                </div>
              </div>
            </div>
          )}

          {/* Network Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Network</h4>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Connection</div>
                  <div className="text-white">
                    {navigator.connection ? navigator.connection.effectiveType : 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">RTT</div>
                  <div className="text-white">
                    {navigator.connection ? `${navigator.connection.rtt}ms` : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h5 className="text-blue-400 font-medium mb-2">Performance Tips</h5>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Keep LCP under 2.5 seconds</li>
              <li>• Maintain FID below 100 milliseconds</li>
              <li>• Ensure CLS is less than 0.1</li>
              <li>• Monitor memory usage for leaks</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PerformanceMonitor