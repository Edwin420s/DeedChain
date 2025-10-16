import { useState, useEffect } from 'react'
import { useSecurity } from '../hooks/useSecurity'
import { useWallet } from '../context/WalletContext'
import Modal from './Modal'

const SecurityMonitor = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const { securityLog, logSecurityEvent } = useSecurity()
  const { address } = useWallet()

  useEffect(() => {
    // Log initial security event
    logSecurityEvent('session_start', { address })
    
    // Monitor for suspicious activities
    const monitorActivities = () => {
      // Check for dev tools (basic detection)
      const checkDevTools = () => {
        const threshold = 160
        const widthThreshold = window.outerWidth - window.innerWidth > threshold
        const heightThreshold = window.outerHeight - window.innerHeight > threshold
        
        if (widthThreshold || heightThreshold) {
          logSecurityEvent('dev_tools_detected', { 
            widthDiff: window.outerWidth - window.innerWidth,
            heightDiff: window.outerHeight - window.innerHeight
          })
        }
      }
      
      // Check for automation
      const checkAutomation = () => {
        if (navigator.webdriver) {
          logSecurityEvent('automation_detected', { type: 'webdriver' })
        }
      }
      
      checkDevTools()
      checkAutomation()
    }
    
    monitorActivities()
    const interval = setInterval(monitorActivities, 30000)
    
    return () => clearInterval(interval)
  }, [address, logSecurityEvent])

  const getSecurityScore = () => {
    const warningEvents = securityLog.filter(event => 
      event.event.includes('failed') || event.event.includes('detected')
    ).length
    
    const totalEvents = securityLog.length
    const score = totalEvents > 0 ? Math.max(0, 100 - (warningEvents / totalEvents) * 100) : 100
    
    return {
      score: Math.round(score),
      level: score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs_attention'
    }
  }

  const securityScore = getSecurityScore()

  const getLevelColor = (level) => {
    const colors = {
      excellent: 'text-green-400',
      good: 'text-yellow-400',
      needs_attention: 'text-red-400'
    }
    return colors[level] || 'text-gray-400'
  }

  if (process.env.NODE_ENV !== 'development') {
    return null // Only show in development
  }

  return (
    <>
      {/* Security Indicator */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-16 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        aria-label="Security Monitor"
      >
        <div className={`w-3 h-3 rounded-full ${
          securityScore.level === 'excellent' ? 'bg-green-400' :
          securityScore.level === 'good' ? 'bg-yellow-400' : 'bg-red-400'
        }`} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Security Monitor">
        <div className="space-y-6">
          {/* Security Score */}
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Security Status</h3>
            <div className="text-4xl font-bold mb-2">
              <span className={getLevelColor(securityScore.level)}>
                {securityScore.score}
              </span>
              <span className="text-gray-400 text-lg">/100</span>
            </div>
            <div className={`text-sm font-medium ${getLevelColor(securityScore.level)}`}>
              {securityScore.level.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {['overview', 'events', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-accent-teal text-accent-teal'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400">Total Events</div>
                    <div className="text-white font-semibold">{securityLog.length}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400">Warnings</div>
                    <div className="text-yellow-400 font-semibold">
                      {securityLog.filter(e => e.event.includes('failed') || e.event.includes('detected')).length}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-xs">
                    {securityLog.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex justify-between text-gray-300">
                        <span className="truncate">{event.event}</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-2">
                {securityLog.map((event, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white text-sm font-medium">{event.event}</span>
                      <span className="text-gray-400 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {Object.keys(event.details).length > 0 && (
                      <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm">
                    <strong>Development Mode:</strong> Security monitor is only visible in development.
                    In production, security events are logged silently.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    localStorage.removeItem('deedchain-security-log')
                    window.location.reload()
                  }}
                  className="w-full btn-secondary"
                >
                  Clear Security Log
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-xs text-center">
              Security monitoring active • {securityLog.length} events logged
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default SecurityMonitor