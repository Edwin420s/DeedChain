// Application Constants
export const APP_CONFIG = {
  name: 'DeedChain',
  version: '1.0.0',
  description: 'Land Ownership & Tokenization Platform',
  supportEmail: 'support@deedchain.com',
  social: {
    twitter: 'https://twitter.com/deedchain',
    github: 'https://github.com/deedchain',
    discord: 'https://discord.gg/deedchain',
    telegram: 'https://t.me/deedchain'
  }
}

// Blockchain Constants
export const BLOCKCHAIN_CONFIG = {
  defaultChainId: 137, // Polygon Mainnet
  supportedChains: [137, 80001, 1, 5], // Polygon, Mumbai, Ethereum, Goerli
  nativeCurrency: {
    137: { symbol: 'MATIC', decimals: 18 },
    80001: { symbol: 'MATIC', decimals: 18 },
    1: { symbol: 'ETH', decimals: 18 },
    5: { symbol: 'ETH', decimals: 18 }
  },
  blockExplorers: {
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io'
  },
  rpcUrls: {
    137: 'https://polygon-rpc.com',
    80001: 'https://rpc-mumbai.matic.today',
    1: 'https://mainnet.infura.io/v3/',
    5: 'https://goerli.infura.io/v3/'
  }
}

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  137: { // Polygon Mainnet
    DEED_NFT: process.env.NEXT_PUBLIC_DEED_NFT_ADDRESS || '0x1234...',
    LAND_REGISTRY: process.env.NEXT_PUBLIC_LAND_REGISTRY_ADDRESS || '0x1234...',
    TOKENIZATION_FACTORY: process.env.NEXT_PUBLIC_TOKENIZATION_FACTORY_ADDRESS || '0x1234...',
    TRANSFER_MANAGER: process.env.NEXT_PUBLIC_TRANSFER_MANAGER_ADDRESS || '0x1234...'
  },
  80001: { // Polygon Mumbai
    DEED_NFT: process.env.NEXT_PUBLIC_DEED_NFT_ADDRESS_TESTNET || '0x1234...',
    LAND_REGISTRY: process.env.NEXT_PUBLIC_LAND_REGISTRY_ADDRESS_TESTNET || '0x1234...',
    TOKENIZATION_FACTORY: process.env.NEXT_PUBLIC_TOKENIZATION_FACTORY_ADDRESS_TESTNET || '0x1234...',
    TRANSFER_MANAGER: process.env.NEXT_PUBLIC_TRANSFER_MANAGER_ADDRESS_TESTNET || '0x1234...'
  }
}

// IPFS Configuration
export const IPFS_CONFIG = {
  gateway: 'https://ipfs.io/ipfs/',
  uploadService: 'web3.storage', // or 'pinata'
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

// User Roles
export const USER_ROLES = {
  USER: 'user',
  VERIFIER: 'verifier',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}

// Property Status
export const PROPERTY_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  TRANSFERRING: 'transferring',
  TOKENIZED: 'tokenized',
  ARCHIVED: 'archived'
}

// Transaction Types
export const TRANSACTION_TYPES = {
  REGISTRATION: 'registration',
  VERIFICATION: 'verification',
  TRANSFER: 'transfer',
  TOKENIZATION: 'tokenization',
  BURN: 'burn',
  UPDATE: 'update'
}

// Notification Types
export const NOTIFICATION_TYPES = {
  VERIFICATION: 'verification',
  TRANSFER: 'transfer',
  TOKENIZATION: 'tokenization',
  SYSTEM: 'system',
  WARNING: 'warning',
  SUCCESS: 'success'
}

// API Endpoints
export const API_ENDPOINTS = {
  // Property endpoints
  PROPERTIES: '/api/properties',
  PROPERTY_DETAIL: (id) => `/api/properties/${id}`,
  PROPERTY_REGISTER: '/api/properties/register',
  PROPERTY_VERIFY: '/api/properties/verify',
  PROPERTY_TRANSFER: '/api/properties/transfer',
  
  // User endpoints
  USER_PROFILE: (address) => `/api/users/${address}`,
  USER_PROPERTIES: (address) => `/api/users/${address}/properties`,
  USER_TRANSACTIONS: (address) => `/api/users/${address}/transactions`,
  
  // Marketplace endpoints
  MARKETPLACE: '/api/marketplace',
  TOKENIZED_PROPERTIES: '/api/marketplace/tokenized',
  
  // Admin endpoints
  ADMIN_STATS: '/api/admin/stats',
  ADMIN_PENDING: '/api/admin/pending',
  ADMIN_VERIFY: '/api/admin/verify',
  
  // Export endpoints
  EXPORT_DATA: (address) => `/api/export/${address}`
}

// Form Validation Rules
export const VALIDATION_RULES = {
  WALLET_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  COORDINATES: {
    LAT: /^-?([0-8]?[0-9]|90)(\.[0-9]{1,6})?$/,
    LNG: /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,6})?$/
  },
  SURVEY_NUMBER: /^[A-Za-z0-9\-_]+$/,
  AREA: /^\d+(\.\d{1,2})?$/
}

// Gas and Fee Configuration
export const GAS_CONFIG = {
  DEFAULT_GAS_LIMIT: {
    REGISTRATION: 300000,
    TRANSFER: 200000,
    TOKENIZATION: 500000,
    VERIFICATION: 150000
  },
  PRIORITY_LEVELS: {
    LOW: { multiplier: 0.9, name: 'Low' },
    MEDIUM: { multiplier: 1.0, name: 'Medium' },
    HIGH: { multiplier: 1.1, name: 'High' },
    URGENT: { multiplier: 1.3, name: 'Urgent' }
  },
  MAX_GAS_PRICE: 1000 // Gwei
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'deedchain-theme',
  USER_PREFERENCES: 'deedchain-user-preferences',
  RECENT_TRANSACTIONS: 'deedchain-recent-transactions',
  SECURITY_LOG: 'deedchain-security-log',
  ONBOARDING_TOURS: 'deedchain-tours',
  ACCESSIBILITY_SETTINGS: 'deedchain-accessibility'
}

// Feature Flags
export const FEATURE_FLAGS = {
  BATCH_OPERATIONS: true,
  MULTI_SIG: true,
  ADVANCED_ANALYTICS: true,
  REAL_TIME_UPDATES: true,
  GAS_OPTIMIZATION: true,
  EXPORT_FUNCTIONALITY: true
}

// Default Values
export const DEFAULTS = {
  PAGINATION: {
    PAGE_SIZE: 10,
    PAGE_SIZES: [10, 25, 50, 100]
  },
  FILTERS: {
    SORT_BY: 'newest',
    STATUS: 'all',
    AREA_RANGE: { min: 0, max: null },
    DATE_RANGE: { start: null, end: null }
  },
  MAP: {
    DEFAULT_CENTER: { lat: -1.2921, lng: 36.8219 }, // Nairobi
    DEFAULT_ZOOM: 13,
    MAX_ZOOM: 18,
    MIN_ZOOM: 8
  }
}

export default {
  APP_CONFIG,
  BLOCKCHAIN_CONFIG,
  CONTRACT_ADDRESSES,
  IPFS_CONFIG,
  USER_ROLES,
  PROPERTY_STATUS,
  TRANSACTION_TYPES,
  NOTIFICATION_TYPES,
  API_ENDPOINTS,
  VALIDATION_RULES,
  GAS_CONFIG,
  STORAGE_KEYS,
  FEATURE_FLAGS,
  DEFAULTS
}