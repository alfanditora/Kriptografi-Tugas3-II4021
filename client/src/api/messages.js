import apiClient from './index'
import { mockApi, isMockEnabled } from '../mocks'

export const messageApi = {
  async getContacts() {
    if (isMockEnabled) return mockApi.messages.getContacts();
    const response = await apiClient.get('/contacts')
    return response.data
  },

  async getConversationCrypto(conversationId) {
    if (isMockEnabled) return mockApi.messages.getConversationCrypto(conversationId);
    const response = await apiClient.get(`/conversations/${conversationId}/crypto`)
    return response.data
  },

  async getMessages(conversationId) {
    if (isMockEnabled) return mockApi.messages.getMessages(conversationId);
    const response = await apiClient.get(`/conversations/${conversationId}/messages`)
    return response.data
  },

  async sendMessage(conversationId, payload) {
    if (isMockEnabled) return mockApi.messages.sendMessage(conversationId, payload);
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, { payload })
    return response.data
  }
}
