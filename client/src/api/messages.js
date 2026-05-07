import apiClient from './index'
import { mockApi, isMockEnabled } from '../mocks'
import { EventSourcePolyfill } from 'event-source-polyfill'

export const messageApi = {
  async getContacts() {
    if (isMockEnabled) return mockApi.messages.getContacts();
    const response = await apiClient.get('/contacts')
    return response.data
  },

  async getConversationCrypto(userId) {
    if (isMockEnabled) return mockApi.messages.getConversationCrypto(userId);
    const response = await apiClient.get(`/users/${userId}/public-key`)
    return response.data
  },

  async getMessages(userId) {
    if (isMockEnabled) return mockApi.messages.getMessages(userId);
    const response = await apiClient.get(`/messages/${userId}`)
    return response.data
  },

  async sendMessage({ receiverId, ciphertext, iv, mac }) {
    if (isMockEnabled) return mockApi.messages.sendMessage(receiverId, JSON.stringify({ ciphertext, iv, mac }));
    const response = await apiClient.post('/messages', {
      receiverId,
      ciphertext,
      iv,
      mac
    })
    return response.data
  },

  /**
   * Subscribe to message stream via SSE
   * @param {Function} onMessage - Callback when new message arrives
   * @param {Function} onError - Callback on connection error
   * @returns {EventSource} - EventSource instance for cleanup
   */
  subscribeToMessageStream(onMessage, onError) {
    if (isMockEnabled) {
      // Mock SSE support - no real streaming
      return null
    }
    
    const baseUrl = apiClient.defaults.baseURL || ''
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    const eventSource = new EventSourcePolyfill(`${baseUrl}/messages/stream`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        onMessage(message)
      } catch (err) {
        console.error('Failed to parse SSE message:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
      if (onError) onError(err)
    }

    return eventSource
  }
}
