// Konstanta Aplikasi

export const APP_NAME = 'SEChatbox'

// Endpoint API - Disesuaikan dengan spesifikasi backend
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

// Konstanta Kriptografi - Disesuaikan dengan spesifikasi backend
export const CRYPTO = {
  // Kurva ECDH untuk pertukaran kunci
  ECDH_CURVE: 'X25519',
  
  // AES-256-CBC untuk enkripsi kunci privat dan enkripsi pesan
  AES_ALGORITHM: 'AES-CBC',
  AES_KEY_SIZE: 256,
  AES_IV_LENGTH: 16, // CBC menggunakan IV 16-byte
  
  // Pengaturan PBKDF2 untuk derivasi kunci dari password
  PBKDF2_ALGORITHM: 'PBKDF2',
  PBKDF2_HASH: 'SHA-256',
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_SALT_LENGTH: 16, // 128 bit
  
  // Pengaturan HKDF untuk shared secret → kunci AES
  HKDF_HASH: 'SHA-256',
  
  // Pengaturan HMAC untuk autentikasi pesan (bonus)
  HMAC_ALGORITHM: 'HMAC',
  HMAC_HASH: 'SHA-256'
}

// Kunci Penyimpanan (Storage Keys)
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PRIVATE_KEY: 'private_key_decrypted' // Menyimpan kunci hasil dekripsi untuk sesi ini
}

// Validasi
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128
}
