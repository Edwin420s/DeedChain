import { useState, useEffect } from 'react'
import { useContract, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import Modal from './Modal'

const ContractInteraction = ({ 
  isOpen, 
  onClose, 
  contractAddress, 
  abi, 
  functionName,
  defaultValues = {} 
}) => {
  const { data: signer } = useSigner()
  const contract = useContract({
    address: contractAddress,
    abi: abi,
    signerOrProvider: signer
  })

  const [inputs, setInputs] = useState([])
  const [values, setValues] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (contract && functionName) {
      loadFunctionDetails()
    }
  }, [contract, functionName])

  const loadFunctionDetails = () => {
    try {
      const contractInterface = new ethers.utils.Interface(abi)
      const functionFragment = contractInterface.getFunction(functionName)
      
      if (functionFragment) {
        setInputs(functionFragment.inputs)
        
        // Initialize values with defaults
        const initialValues = {}
        functionFragment.inputs.forEach((input, index) => {
          initialValues[input.name] = defaultValues[input.name] || ''
        })
        setValues(initialValues)
      }
    } catch (err) {
      setError('Failed to load function details')
      console.error('Error loading function:', err)
    }
  }

  const handleInputChange = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const executeFunction = async () => {
    if (!contract) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const args = inputs.map(input => {
        const value = values[input.name]
        
        // Convert types appropriately
        if (input.type === 'uint256' || input.type === 'uint') {
          return ethers.BigNumber.from(value)
        } else if (input.type === 'bool') {
          return value === 'true'
        } else if (input.type === 'address') {
          return ethers.utils.getAddress(value)
        }
        
        return value
      })

      let transaction
      if (functionName.includes('view') || functionName.includes('pure')) {
        // Read-only function
        const result = await contract[functionName](...args)
        setResult({ type: 'read', data: result })
      } else {
        // Write function
        transaction = await contract[functionName](...args)
        setResult({ type: 'write', data: transaction })
        
        // Wait for confirmation if it's a write
        const receipt = await transaction.wait()
        setResult(prev => ({ ...prev, receipt }))
      }
    } catch (err) {
      setError(err.message)
      console.error('Contract interaction failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value) => {
    if (ethers.BigNumber.isBigNumber(value)) {
      return value.toString()
    } else if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return value
  }

  const getInputType = (solidityType) => {
    if (solidityType.includes('uint')) return 'number'
    if (solidityType === 'bool') return 'select'
    if (solidityType === 'address') return 'text'
    if (solidityType === 'string') return 'text'
    return 'text'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contract Interaction: ${functionName}`}>
      <div className="space-y-6">
        {/* Contract Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Contract Details</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Address: {contractAddress}</div>
            <div>Function: {functionName}</div>
            <div>Network: Polygon Mainnet</div>
          </div>
        </div>

        {/* Function Inputs */}
        {inputs.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Function Parameters</h4>
            <div className="space-y-4">
              {inputs.map((input, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {input.name} ({input.type})
                  </label>
                  
                  {getInputType(input.type) === 'select' ? (
                    <select
                      value={values[input.name] || ''}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-accent-teal"
                    >
                      <option value="">Select...</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <input
                      type={getInputType(input.type)}
                      value={values[input.name] || ''}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      placeholder={`Enter ${input.type}`}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-teal"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execution Result */}
        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-medium mb-2">
              {result.type === 'read' ? 'Function Result' : 'Transaction Sent'}
            </h4>
            <pre className="text-green-300 text-sm whitespace-pre-wrap">
              {formatValue(result.data)}
            </pre>
            {result.receipt && (
              <div className="mt-2 text-xs text-green-400">
                Transaction confirmed in block #{result.receipt.blockNumber}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="text-red-400 font-medium mb-2">Error</h4>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={executeFunction}
            disabled={loading || inputs.some(input => !values[input.name])}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-deedchain-navy border-t-transparent rounded-full animate-spin mr-2"></div>
                Executing...
              </div>
            ) : (
              'Execute Function'
            )}
          </button>
        </div>

        {/* Contract ABI Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <h5 className="text-blue-400 font-medium mb-2">Contract Interaction</h5>
          <p className="text-blue-300 text-xs">
            This interface allows you to interact directly with smart contract functions. 
            Make sure you understand the function parameters before execution.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default ContractInteraction