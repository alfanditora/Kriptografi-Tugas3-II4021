const MOCK_MESSAGES_KEY = 'sechatbox_mock_messages';

function getMessages() {
  const data = localStorage.getItem(MOCK_MESSAGES_KEY);
  return data ? JSON.parse(data) : [];
}

export const messageHandlers = {
  async getContacts() {
    const users = JSON.parse(localStorage.getItem('sechatbox_mock_users') || '[]');
    return { items: users.map(u => ({ id: u.id, email: u.email })) };
  },

  async getConversationCrypto(conversationId) {
    const users = JSON.parse(localStorage.getItem('sechatbox_mock_users') || '[]');
    // Simulasi: ambil user kedua sebagai peer
    const peer = users[1] || users[0];
    return {
      otherUser: { id: peer.id, email: peer.email },
      publicKey: peer.crypto.publicKey
    };
  },

  async getMessages(conversationId) {
    const messages = getMessages().filter(m => m.conversationId === conversationId);
    return { items: messages };
  },

  async sendMessage(conversationId, payload) {
    const messages = getMessages();
    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      payload,
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    localStorage.setItem(MOCK_MESSAGES_KEY, JSON.stringify(messages));
    return { message: newMessage };
  }
};
