import { authHandlers } from './handlers/auth';
import { messageHandlers } from './handlers/messages';
import { generateMockUser } from './data/generator';

export const isMockEnabled = import.meta.env.VITE_USE_MOCK_API === 'true';

export const mockApi = {
  auth: authHandlers,
  messages: messageHandlers
};

export async function initMockData() {
  const users = localStorage.getItem('sechatbox_mock_users');
  if (!users || JSON.parse(users).length === 0) {
    const alice = await generateMockUser('alice@example.com', 'alice123');
    const bob = await generateMockUser('bob@example.com', 'bob123');
    localStorage.setItem('sechatbox_mock_users', JSON.stringify([alice, bob]));
  }
}
