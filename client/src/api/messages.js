import apiClient from './index'
import { mockApi, isMockEnabled } from '../mocks'

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
  }
}
