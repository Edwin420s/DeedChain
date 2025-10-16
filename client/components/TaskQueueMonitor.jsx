import { useState, useEffect } from 'react'
import { useTaskQueue } from '../hooks/useTaskQueue'
import { queueManager } from '../utils/queue'
import Modal from './Modal'

const TaskQueueMonitor = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeQueue, setActiveQueue] = useState('ipfsUpload')
  const [overallStatus, setOverallStatus] = useState({})

  const ipfsQueue = useTaskQueue('ipfsUpload')
  const transactionQueue = useTaskQueue('blockchainTransactions')
  const syncQueue = useTaskQueue('dataSync')

  const queues = {
    ipfsUpload: ipfsQueue,
    blockchainTransactions: transactionQueue,
    dataSync: syncQueue
  }

  useEffect(() => {
    const updateOverallStatus = () => {
      setOverallStatus(queueManager.getOverallStatus())
    }

    updateOverallStatus()
    const interval = setInterval(updateOverallStatus, 2000)

    return () => clearInterval(interval)
  }, [])

  const getQueueColor = (queue) => {
    if (queue.processing > 0) return 'text-yellow-400'
    if (queue.total > 0) return 'text-blue-400'
    return 'text-green-400'
  }

  const getQueueIcon = (queue) => {
    if (queue.processing > 0) return '⚡'
    if (queue.total > 0) return '⏳'
    return '✅'
  }

  const currentQueue = queues[activeQueue]

  return (
    <>
      {/* Queue Monitor Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-48 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-teal"
        aria-label="Task Queue Monitor"
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>

          {/* Activity Indicator */}
          {(ipfsQueue.hasPendingTasks || transactionQueue.hasPendingTasks || syncQueue.hasPendingTasks) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Task Queue Monitor">
        <div className="space-y-6">
          {/* Queue Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Select Queue</h4>
            <div className="flex space-x-2 mb-6">
              {Object.keys(queues).map((queueName) => (
                <button
                  key={queueName}
                  onClick={() => setActiveQueue(queueName)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeQueue === queueName
                      ? 'bg-accent-teal text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {queueName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Overall Status */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Overall Status</h4>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(overallStatus).map(([queueName, status]) => (
                <div key={queueName} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 capitalize">
                      {queueName.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className={`text-xs ${getQueueColor({ total: status.total, processing: status.processing })}`}>
                      {getQueueIcon({ total: status.total, processing: status.processing })}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {status.total}
                  </div>
                  <div className="text-xs text-gray-400">
                    {status.processing} processing
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Queue Details */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              {activeQueue.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Queue
            </h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{currentQueue.queueStatus.total}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{currentQueue.queueStatus.processing}</div>
                  <div className="text-xs text-gray-400">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{currentQueue.queueStatus.completed}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{currentQueue.queueStatus.failed}</div>
                  <div className="text-xs text-gray-400">Failed</div>
                </div>
              </div>

              {/* Progress Bar */}
              {currentQueue.queueStatus.total > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round(((currentQueue.queueStatus.completed + currentQueue.queueStatus.failed) / currentQueue.queueStatus.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-accent-teal h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentQueue.queueStatus.completed + currentQueue.queueStatus.failed) / currentQueue.queueStatus.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Queue Controls */}
              <div className="flex space-x-2">
                <button
                  onClick={() => currentQueue.pause()}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  Pause
                </button>
                <button
                  onClick={() => currentQueue.resume()}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={() => currentQueue.clear()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => currentQueue.clearCompleted()}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Tasks</h4>
            <div className="bg-gray-700 rounded-lg max-h-64 overflow-y-auto">
              {currentQueue.recentTasks.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No recent tasks
                </div>
              ) : (
                <div className="divide-y divide-gray-600">
                  {currentQueue.recentTasks.slice(0, 20).map((task) => (
                    <div key={task.id} className="p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-white truncate">
                          Task {task.id.slice(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(task.enqueuedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        task.status === 'completed' ? 'bg-green-600 text-white' :
                        task.status === 'failed' ? 'bg-red-600 text-white' :
                        task.status === 'processing' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default TaskQueueMonitor
