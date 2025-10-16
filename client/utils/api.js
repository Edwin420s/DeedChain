import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const propertyAPI = {
  register: (data) => api.post('/properties/register', data),
  get: (id) => api.get(`/properties/${id}`),
  list: (filters = {}) => api.get('/properties', { params: filters }),
  transfer: (data) => api.post('/transfers/initiate', data),
  tokenize: (data) => api.post('/properties/tokenize', data),
}

export const userAPI = {
  authWallet: (payload) => api.post('/users/auth/wallet', payload),
  getProfile: () => api.get('/users/profile'),
  getProperties: () => api.get('/properties/user/my-properties'),
  updateProfile: (data) => api.put('/users/profile', data),
}

export const adminAPI = {
  getStats: () => api.get('/admin/dashboard'),
  getPendingProperties: () => api.get('/properties', { params: { status: 'PENDING' } }),
  verifyProperty: (data) => api.post('/verifications/:propertyId/verify', data),
  getRecentActivity: () => api.get('/admin/logs'),
}

export const marketplaceAPI = {
  list: (filters = {}) => api.get('/marketplace', { params: filters }),
  getTokenizedProperties: () => api.get('/marketplace/tokenized'),
}

export default api