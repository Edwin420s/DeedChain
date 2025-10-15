export const validateWalletAddress = (address) => {
  if (!address) return false
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const validateCoordinates = (coordinates) => {
  if (!coordinates) return false
  const { lat, lng } = coordinates
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  )
}

export const validatePropertyData = (data) => {
  const errors = {}

  if (!data.location?.trim()) {
    errors.location = 'Location is required'
  }

  if (!data.area || data.area <= 0) {
    errors.area = 'Valid area is required'
  }

  if (!data.surveyNumber?.trim()) {
    errors.surveyNumber = 'Survey number is required'
  }

  if (data.coordinates && !validateCoordinates(data.coordinates)) {
    errors.coordinates = 'Invalid coordinates'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateTransferData = (data) => {
  const errors = {}

  if (!validateWalletAddress(data.recipient)) {
    errors.recipient = 'Valid wallet address is required'
  }

  if (!data.propertyId) {
    errors.propertyId = 'Property ID is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateTokenizationData = (data) => {
  const errors = {}

  if (!data.tokenName?.trim()) {
    errors.tokenName = 'Token name is required'
  }

  if (!data.tokenSymbol?.trim() || data.tokenSymbol.length > 10) {
    errors.tokenSymbol = 'Token symbol is required (max 10 characters)'
  }

  if (!data.totalSupply || data.totalSupply <= 0) {
    errors.totalSupply = 'Valid total supply is required'
  }

  if (!data.pricePerToken || data.pricePerToken <= 0) {
    errors.pricePerToken = 'Valid price per token is required'
  }

  if (!data.reservePercentage || data.reservePercentage < 0 || data.reservePercentage > 100) {
    errors.reservePercentage = 'Valid reserve percentage is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}