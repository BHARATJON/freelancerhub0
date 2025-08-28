import axios from 'axios'
import { toast } from 'react-toastify'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    
    // Handle different error status codes
    switch (error.response?.status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        break
      case 403:
        toast.error('Access denied. You do not have permission to perform this action.')
        break
      case 404:
        toast.error('Resource not found.')
        break
      case 422:
        // Validation errors
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors
          Object.values(errors).forEach(error => {
            toast.error(error[0])
          })
        } else {
          toast.error(message)
        }
        break
      case 500:
        toast.error('Server error. Please try again later.')
        break
      default:
        toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api 