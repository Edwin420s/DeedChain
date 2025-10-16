// Task queue for managing background operations
class TaskQueue {
  constructor(options = {}) {
    this.queue = []
    this.processing = false
    this.concurrency = options.concurrency || 1
    this.retryAttempts = options.retryAttempts || 3
    this.retryDelay = options.retryDelay || 1000
    this.onTaskComplete = options.onTaskComplete || (() => {})
    this.onTaskError = options.onTaskError || (() => {})
    this.onQueueEmpty = options.onQueueEmpty || (() => {})
  }

  // Add task to queue
  enqueue(task) {
    const taskWithMetadata = {
      id: this.generateId(),
      task,
      attempts: 0,
      addedAt: new Date().toISOString(),
      status: 'pending'
    }
    
    this.queue.push(taskWithMetadata)
    this.processQueue()
    
    return taskWithMetadata.id
  }

  // Process the queue
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const availableSlots = this.concurrency
      const tasksToProcess = this.queue.splice(0, availableSlots)

      await Promise.allSettled(
        tasksToProcess.map(task => this.processTask(task))
      )
    }

    this.processing = false
    this.onQueueEmpty()
  }

  // Process individual task
  async processTask(taskWithMetadata) {
    try {
      taskWithMetadata.status = 'processing'
      taskWithMetadata.startedAt = new Date().toISOString()
      
      const result = await taskWithMetadata.task()
      
      taskWithMetadata.status = 'completed'
      taskWithMetadata.completedAt = new Date().toISOString()
      
      this.onTaskComplete(result, taskWithMetadata)
    } catch (error) {
      taskWithMetadata.attempts++
      taskWithMetadata.lastError = error.message
      
      if (taskWithMetadata.attempts < this.retryAttempts) {
        // Retry after delay
        taskWithMetadata.status = 'retrying'
        setTimeout(() => {
          this.queue.unshift(taskWithMetadata)
          this.processQueue()
        }, this.retryDelay * taskWithMetadata.attempts)
      } else {
        // Max retries reached
        taskWithMetadata.status = 'failed'
        taskWithMetadata.failedAt = new Date().toISOString()
        this.onTaskError(error, taskWithMetadata)
      }
    }
  }

  // Get queue status
  getStatus() {
    const status = {
      total: this.queue.length,
      pending: this.queue.filter(t => t.status === 'pending').length,
      processing: this.queue.filter(t => t.status === 'processing').length,
      retrying: this.queue.filter(t => t.status === 'retrying').length,
      completed: 0, // Would need to track completed tasks
      failed: 0     // Would need to track failed tasks
    }
    
    return status
  }

  // Clear queue
  clear() {
    this.queue = []
  }

  // Pause queue
  pause() {
    this.processing = false
  }

  // Resume queue
  resume() {
    this.processQueue()
  }

  // Generate unique task ID
  generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Specific task queues for different operations
export const taskQueues = {
  // IPFS upload queue
  ipfsUpload: new TaskQueue({
    concurrency: 2,
    retryAttempts: 3,
    retryDelay: 2000,
    onTaskComplete: (result, task) => {
      console.log('IPFS upload completed:', task.id, result)
    },
    onTaskError: (error, task) => {
      console.error('IPFS upload failed:', task.id, error)
    }
  }),

  // Blockchain transaction queue
  blockchainTransactions: new TaskQueue({
    concurrency: 1, // Process one at a time for nonce management
    retryAttempts: 5,
    retryDelay: 3000,
    onTaskComplete: (result, task) => {
      console.log('Transaction completed:', task.id, result)
    },
    onTaskError: (error, task) => {
      console.error('Transaction failed:', task.id, error)
    }
  }),

  // Data sync queue
  dataSync: new TaskQueue({
    concurrency: 3,
    retryAttempts: 2,
    retryDelay: 1000,
    onTaskComplete: (result, task) => {
      console.log('Data sync completed:', task.id)
    },
    onTaskError: (error, task) => {
      console.error('Data sync failed:', task.id, error)
    }
  })
}

// Task creators for common operations
export const taskCreators = {
  // IPFS upload task
  createIpfsUploadTask: (files, onProgress = null) => {
    return async () => {
      // Simulate IPFS upload
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('IPFS upload failed')
      }

      return await response.json()
    }
  },

  // Blockchain transaction task
  createTransactionTask: (transactionConfig) => {
    return async () => {
      const { contract, method, args, options } = transactionConfig
      
      const transaction = await contract[method](...args, options)
      const receipt = await transaction.wait()
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed on chain')
      }
      
      return receipt
    }
  },

  // Data sync task
  createDataSyncTask: (data, endpoint) => {
    return async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Data sync failed')
      }

      return await response.json()
    }
  },

  // Batch processing task
  createBatchTask: (items, processor, batchSize = 10) => {
    return async () => {
      const results = []
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const batchResults = await Promise.allSettled(
          batch.map(item => processor(item))
        )
        results.push(...batchResults)
        
        // Optional: Add delay between batches
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      return results
    }
  }
}

// Queue management utilities
export const queueManager = {
  // Initialize all queues
  initialize() {
    Object.values(taskQueues).forEach(queue => {
      queue.resume()
    })
  },

  // Pause all queues
  pauseAll() {
    Object.values(taskQueues).forEach(queue => {
      queue.pause()
    })
  },

  // Get overall queue status
  getOverallStatus() {
    const status = {}
    
    Object.entries(taskQueues).forEach(([name, queue]) => {
      status[name] = queue.getStatus()
    })
    
    return status
  },

  // Wait for all queues to be empty
  async waitForAllQueues() {
    const queues = Object.values(taskQueues)
    
    while (queues.some(queue => queue.getStatus().total > 0)) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

export default TaskQueue