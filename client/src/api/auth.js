import apiClient from './index'
import { mockApi, isMockEnabled } from '../mocks'

export const authApi = {
  async login(credentials) {
    if (isMockEnabled) return mockApi.auth.login(credentials);
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async register(userData) {
    if (isMockEnabled) return mockApi.auth.register(userData);
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  }
}
