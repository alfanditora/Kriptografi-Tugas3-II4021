// App Constants

export const APP_NAME = 'SEChatbox'

// API Endpoints - Aligned with backend spec
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout'
  },
  CONTACTS: {
    LIST: '/contacts'
  },
  CONVERSATIONS: {
    LIST: '/conversations',
    CREATE: '/conversations',
    GET: (id) => `/conversations/${id}`,
    CRYPTO: (id) => `/conversations/${id}/crypto`,
    MESSAGES: (id) => `/conversations/${id}/messages`,
    MESSAGES_SINCE: (id, since) => `/conversations/${id}/messages?since=${since}`
  }
}

// Crypto Constants - Aligned with backend spec
export const CRYPTO = {
  // ECDH curve for key exchange
  ECDH_CURVE: 'X25519',
  
  // AES-256-CBC for private key encryption and message encryption
  AES_ALGORITHM: 'AES-CBC',
  AES_KEY_SIZE: 256,
  AES_IV_LENGTH: 16, // CBC uses 16-byte IV
  
  // PBKDF2 settings for password-to-key derivation
  PBKDF2_ALGORITHM: 'PBKDF2',
  PBKDF2_HASH: 'SHA-256',
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_SALT_LENGTH: 16, // 128 bits
  
  // HKDF settings for shared secret → AES key
  HKDF_HASH: 'SHA-256',
  
  // HMAC settings for message authentication (bonus)
  HMAC_ALGORITHM: 'HMAC',
  HMAC_HASH: 'SHA-256'
}

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PRIVATE_KEY: 'private_key_decrypted' // Stores decrypted key for session
}

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128
}
