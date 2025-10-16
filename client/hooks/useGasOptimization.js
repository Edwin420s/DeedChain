import { useState, useEffect, useCallback } from 'react'
import { useProvider } from 'wagmi'
import { ethers } from 'ethers'

export const useGasOptimization = () => {
  const provider = useProvider()
  const [gasData, setGasData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchGasData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const feeData = await provider.getFeeData()
      
      // Get historical gas data (mock for now)
      const historicalData = await getHistoricalGasData()
      
      setGasData({
        current: {
          gasPrice: feeData.gasPrice,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        },
        historical: historicalData,
        recommendations: generateRecommendations(feeData)
      })
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch gas data:', err)
    } finally {
      setLoading(false)
    }
  }, [provider])

  const getHistoricalGasData = async () => {
    // Mock historical data - in real app, fetch from API
    return {
      low: ethers.utils.parseUnits('30', 'gwei'),
      average: ethers.utils.parseUnits('50', 'gwei'),
      high: ethers.utils.parseUnits('100', 'gwei'),
      trend: 'stable' // rising, falling, stable
    }
  }

  const generateRecommendations = (feeData) => {
    const currentGas = feeData.gasPrice
    const historical = {
      low: ethers.utils.parseUnits('30', 'gwei'),
      average: ethers.utils.parseUnits('50', 'gwei'),
      high: ethers.utils.parseUnits('100', 'gwei')
    }

    return {
      low: {
        gasPrice: historical.low.mul(95).div(100), // 5% below historical low
        confidence: currentGas.gt(historical.average) ? 'high' : 'low',
        description: 'Wait for lower gas prices'
      },
      medium: {
        gasPrice: historical.average,
        confidence: 'medium',
        description: 'Standard market rate'
      },
      high: {
        gasPrice: currentGas.mul(110).div(100), // 10% above current
        confidence: 'high',
        description: 'Priority transaction'
      }
    }
  }

  const optimizeTransaction = useCallback(async (transaction) => {
    if (!gasData) return transaction

    const { recommendations } = gasData
    const selectedPriority = transaction.priority || 'medium'
    const optimizedGas = recommendations[selectedPriority].gasPrice

    return {
      ...transaction,
      gasPrice: optimizedGas,
      maxFeePerGas: optimizedGas.mul(120).div(100),
      maxPriorityFeePerGas: optimizedGas.mul(10).div(100)
    }
  }, [gasData])

  const estimateTransactionCost = useCallback(async (transaction) => {
    try {
      const gasLimit = await provider.estimateGas(transaction)
      const gasPrice = transaction.gasPrice || gasData?.current.gasPrice
      
      if (!gasPrice) return null

      const gasCost = gasPrice.mul(gasLimit)
      const maticCost = ethers.utils.formatEther(gasCost)
      const usdCost = parseFloat(maticCost) * 0.75 // Mock conversion rate

      return {
        gasLimit,
        gasPrice,
        maticCost,
        usdCost,
        gasCost
      }
    } catch (err) {
      console.error('Failed to estimate transaction cost:', err)
      return null
    }
  }, [provider, gasData])

  useEffect(() => {
    fetchGasData()
    
    // Refresh gas data every 30 seconds
    const interval = setInterval(fetchGasData, 30000)
    return () => clearInterval(interval)
  }, [fetchGasData])

  return {
    gasData,
    loading,
    error,
    optimizeTransaction,
    estimateTransactionCost,
    refetch: fetchGasData
  }
}