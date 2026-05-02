// App Constants

export const APP_NAME = 'SEChatbox'

// API Endpoints (will be used when backend is ready)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  },
  USERS: {
    LIST: '/users',
    CONTACTS: '/users/contacts'
  },
  MESSAGES: {
    SEND: '/messages',
    GET: '/messages',
    CONVERSATION: (userId) => `/messages/${userId}`
  }
}

// Crypto Constants (for future implementation)
export const CRYPTO = {
  // ECDH curve - will use P-256 for JWT signing and X25519 for key exchange
  ECDH_CURVE: 'X25519',
  ECDSA_CURVE: 'P-256',
  
  // AES settings
  AES_ALGORITHM: 'AES-GCM',
  AES_KEY_SIZE: 256,
  AES_IV_LENGTH: 12,
  
  // HKDF settings
  HKDF_HASH: 'SHA-256'
}

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PRIVATE_KEY: 'private_key_encrypted'
}

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128
}
