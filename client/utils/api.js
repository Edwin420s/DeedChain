import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

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
  register: (data) => api.post('/property/register', data),
  get: (id) => api.get(`/property/${id}`),
  list: (filters = {}) => api.get('/property', { params: filters }),
  transfer: (data) => api.post('/property/transfer', data),
  tokenize: (data) => api.post('/property/tokenize', data),
}

export const userAPI = {
  getProfile: (address) => api.get(`/user/${address}`),
  getProperties: (address) => api.get(`/user/${address}/properties`),
  updateProfile: (data) => api.put('/user/profile', data),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingProperties: () => api.get('/admin/pending-properties'),
  verifyProperty: (data) => api.post('/admin/verify', data),
  getRecentActivity: () => api.get('/admin/recent-activity'),
}

export const marketplaceAPI = {
  list: (filters = {}) => api.get('/marketplace', { params: filters }),
  getTokenizedProperties: () => api.get('/marketplace/tokenized'),
}

export default api