// TypeScript type definitions for DeedChain

// Wallet and Blockchain Types
export interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  balance: string | null
}

export interface UserProfile {
  address: string
  name?: string
  email?: string
  phone?: string
  role: 'user' | 'verifier' | 'admin' | 'super_admin'
  kycVerified: boolean
  registeredAt: string
  stats?: {
    properties: number
    transfers: number
    investments: number
  }
}

// Property Types
export interface Property {
  id: string
  tokenId: number
  owner: string
  location: string
  area: number
  surveyNumber: string
  coordinates?: {
    lat: number
    lng: number
  }
  description?: string
  status: 'draft' | 'pending' | 'under_review' | 'verified' | 'rejected' | 'transferring' | 'tokenized' | 'archived'
  ipfsHash: string
  documents: Document[]
  verified: boolean
  verifiedAt?: string
  verifier?: string
  registeredAt: string
  updatedAt: string
  transfers: Transfer[]
}

export interface Document {
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface Transfer {
  from: string
  to: string
  timestamp: string
  txHash: string
  blockNumber: number
}

// Tokenization Types
export interface TokenizedProperty {
  deedTokenId: number
  tokenContract: string
  tokenName: string
  tokenSymbol: string
  totalSupply: number
  pricePerToken: number
  availableSupply: number
  locked: boolean
  createdAt: string
  property: Property
}

export interface Investment {
  property: TokenizedProperty
  tokens: number
  investmentAmount: number
  ownershipPercentage: number
  investedAt: string
}

// Transaction Types
export interface Transaction {
  id: string
  txHash: string
  type: 'registration' | 'verification' | 'transfer' | 'tokenization' | 'burn' | 'update'
  from: string
  to?: string
  value?: string
  gasUsed: number
  gasPrice: string
  blockNumber: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  property?: Property
  metadata?: any
}

// Marketplace Types
export interface MarketplaceFilters {
  location?: string
  minArea?: number
  maxArea?: number
  priceRange?: string
  propertyType?: 'residential' | 'commercial' | 'agricultural' | 'industrial' | 'vacant'
  status?: string
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc'
}

export interface MarketplaceListing {
  property: Property
  price?: number
  tokenPrice?: number
  availableTokens?: number
  roi?: number
  listedAt: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'verification' | 'transfer' | 'tokenization' | 'system' | 'warning' | 'success'
  message: string
  read: boolean
  timestamp: string
  actionUrl?: string
  metadata?: any
}

// Analytics Types
export interface AnalyticsData {
  totalProperties: number
  verifiedProperties: number
  pendingVerifications: number
  totalUsers: number
  totalTransactions: number
  tokenizedProperties: number
  totalVolume: number
  activeUsers: number
  avgVerificationTime: number
  successRate: number
}

export interface ChartData {
  label: string
  value: number
  color?: string
}

// Form Types
export interface PropertyFormData {
  location: string
  area: number
  surveyNumber: string
  coordinates?: {
    lat: number
    lng: number
  }
  description?: string
  documents: File[]
}

export interface TransferFormData {
  propertyId: number
  recipient: string
  gasPrice?: string
}

export interface TokenizationFormData {
  tokenName: string
  tokenSymbol: string
  totalSupply: number
  pricePerToken: number
  reservePercentage: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Contract Types
export interface ContractConfig {
  address: string
  abi: any[]
  chainId: number
}

export interface GasEstimate {
  gasLimit: number
  gasPrice: string
  maticCost: string
  usdCost: number
  timeEstimate: string
}

// Settings Types
export interface UserPreferences {
  theme: 'dark' | 'light'
  language: string
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    showWalletAddress: boolean
    showProperties: boolean
    showTransactions: boolean
  }
}

export interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'normal' | 'large' | 'xlarge'
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Event Types
export interface AppEvent {
  type: string
  data: any
  timestamp: string
  userId?: string
}

// Export all types
export type {
  WalletState,
  UserProfile,
  Property,
  Document,
  Transfer,
  TokenizedProperty,
  Investment,
  Transaction,
  MarketplaceFilters,
  MarketplaceListing,
  Notification,
  AnalyticsData,
  ChartData,
  PropertyFormData,
  TransferFormData,
  TokenizationFormData,
  ApiResponse,
  PaginatedResponse,
  ContractConfig,
  GasEstimate,
  UserPreferences,
  AccessibilitySettings,
  AppError,
  AppEvent
}