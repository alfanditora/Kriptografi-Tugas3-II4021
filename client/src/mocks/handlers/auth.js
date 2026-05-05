import { generateMockUser } from '../data/generator';

const MOCK_USERS_KEY = 'sechatbox_mock_users';

function getUsers() {
  const data = localStorage.getItem(MOCK_USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export const authHandlers = {
  async register(req) {
    const { email, password, crypto: cryptoData } = req;
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email sudah terdaftar');
    }

    const newUser = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password,
      crypto: cryptoData
    };

    saveUser(newUser);
    return { user: { id: newUser.id, email: newUser.email } };
  },

  async login(req) {
    const { email, password } = req;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Email atau password salah');
    }

    return {
      token: 'mock-jwt-token',
      user: { id: user.id, email: user.email },
      crypto: user.crypto
    };
  }
};
