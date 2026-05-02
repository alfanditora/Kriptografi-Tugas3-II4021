import apiClient from './index'

export const authApi = {
  async login(credentials) {
    // Mock implementation - replace with actual API call later
    // const response = await apiClient.post('/auth/login', credentials)
    // return response.data
    
    // Mock response for now
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: credentials.email
          }
        })
      }, 500)
    })
  },

  async register(userData) {
    // Mock implementation - replace with actual API call later
    // const response = await apiClient.post('/auth/register', userData)
    // return response.data
    
    // Mock response for now
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: userData.email
          }
        })
      }, 500)
    })
  }
}
