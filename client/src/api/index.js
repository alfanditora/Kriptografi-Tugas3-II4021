import axios from 'axios'
import { useToast } from '../composables/useToast'

// Create axios instance with base URL from env
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { error: toastError } = useToast()
    
    // Backend schema often uses 'detail' for error messages
    const message = error.response?.data?.detail || 
                    error.response?.data?.message || 
                    error.message || 
                    'Terjadi kesalahan pada sistem'
    
    // Tampilkan toast error secara otomatis
    toastError(message)
    
    return Promise.reject(new Error(message))
  }
)

export default apiClient
