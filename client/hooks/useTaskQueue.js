import { useState, useEffect, useCallback } from 'react'
import { taskQueues, queueManager } from '../utils/queue'

export const useTaskQueue = (queueName = 'default') => {
  const [queueStatus, setQueueStatus] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    retrying: 0,
    completed: 0,
    failed: 0
  })
  
  const [recentTasks, setRecentTasks] = useState([])

  const queue = taskQueues[queueName] || taskQueues.ipfsUpload

  // Update queue status periodically
  useEffect(() => {
    const updateStatus = () => {
      setQueueStatus(queue.getStatus())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)

    return () => clearInterval(interval)
  }, [queue])

  // Add task to queue
  const enqueue = useCallback((task, metadata = {}) => {
    const taskId = queue.enqueue(task)
    
    const taskWithMetadata = {
      id: taskId,
      ...metadata,
      enqueuedAt: new Date().toISOString(),
      status: 'pending'
    }
    
    setRecentTasks(prev => [taskWithMetadata, ...prev.slice(0, 49)]) // Keep last 50 tasks
    
    return taskId
  }, [queue])

  // Get task status
  const getTaskStatus = useCallback((taskId) => {
    return recentTasks.find(task => task.id === taskId)?.status || 'unknown'
  }, [recentTasks])

  // Wait for specific task to complete
  const waitForTask = useCallback(async (taskId, timeout = 30000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkStatus = () => {
        const task = recentTasks.find(t => t.id === taskId)
        
        if (!task) {
          reject(new Error('Task not found'))
          return
        }
        
        if (task.status === 'completed') {
          resolve(task)
        } else if (task.status === 'failed') {
          reject(new Error('Task failed'))
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Task timeout'))
        } else {
          setTimeout(checkStatus, 100)
        }
      }
      
      checkStatus()
    })
  }, [recentTasks])

  // Wait for all tasks to complete
  const waitForAll = useCallback(async () => {
    await queueManager.waitForAllQueues()
  }, [])

  // Clear completed tasks from history
  const clearCompleted = useCallback(() => {
    setRecentTasks(prev => prev.filter(task => 
      task.status !== 'completed' && task.status !== 'failed'
    ))
  }, [])

  // Get queue statistics
  const getStatistics = useCallback(() => {
    const completed = recentTasks.filter(t => t.status === 'completed').length
    const failed = recentTasks.filter(t => t.status === 'failed').length
    const total = recentTasks.length
    
    return {
      completed,
      failed,
      total,
      successRate: total > 0 ? (completed / total) * 100 : 0
    }
  }, [recentTasks])

  return {
    // Queue state
    queueStatus,
    recentTasks,
    
    // Queue actions
    enqueue,
    getTaskStatus,
    waitForTask,
    waitForAll,
    clearCompleted,
    
    // Queue information
    getStatistics,
    isProcessing: queueStatus.processing > 0,
    hasPendingTasks: queueStatus.total > 0,
    
    // Queue management
    pause: () => queue.pause(),
    resume: () => queue.resume(),
    clear: () => {
      queue.clear()
      setRecentTasks([])
    }
  }
}