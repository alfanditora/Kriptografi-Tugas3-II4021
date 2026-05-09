# SEChatbox (Secure E2E Chat Application)

Aplikasi chat berbasis web (End-to-End Encrypted) yang mengintegrasikan autentikasi, pembentukan kunci komunikasi, dan enkripsi pesan. Proyek ini mendemonstrasikan penerapan JSON Web Token (JWT) berbasis ECDSA, Elliptic Curve Diffie-Hellman (ECDH) dengan X25519, Advanced Encryption Standard (AES-256-CBC), dan otentikasi pesan menggunakan HMAC-SHA256. 

Aplikasi ini menggunakan filosofi "blind server", di mana server hanya bertindak sebagai perantara yang meneruskan pesan terenkripsi tanpa mengetahui isi pesannya (plaintext) dan tanpa menyimpan kunci komunikasi.

## Teknologi yang Digunakan (Tech Stack)

### Client (Frontend)
- **Framework:** Vue.js 3
- **State Management:** Pinia
- **Build Tool:** Vite
- **UI Framework:** Vuetify
- **Kriptografi:** Web Crypto API (Bawaan Browser)
- **Package Manager:** pnpm

### Server (Backend)
- **Framework:** FastAPI (Python)
- **Server Gateway:** Uvicorn
- **Database:** PostgreSQL (via SQLAlchemy ORM)
- **Kriptografi:** `cryptography` (untuk ECDSA & matematis kurva) dan `passlib` (bcrypt)
- **Real-time Engine:** Server-Sent Events (SSE) menggunakan `sse-starlette`

## Dependensi

### Frontend (`client/package.json`)
- `vue`, `pinia`, `vue-router`
- `vuetify` (UI components)
- `axios` (HTTP client)
- `event-source-polyfill` (untuk SSE)
- `vitest` (untuk unit testing)

### Backend (`server/requirements.txt`)
- `fastapi`, `uvicorn`
- `sqlalchemy`, `psycopg2-binary`
- `cryptography`
- `passlib`, `bcrypt`
- `sse-starlette`
- `pytest` (untuk unit testing)

## Tata Cara Menjalankan Program

Proyek ini telah dikemas menggunakan Docker untuk memudahkan instalasi dan eksekusi. Pastikan Anda telah menginstal **Docker** dan **Docker Compose** di perangkat Anda.

### Menjalankan Menggunakan Docker

1. **Jalankan layanan Backend dan Database**  
   Di terminal (pada *root* direktori proyek), jalankan perintah:
   ```bash
   docker-compose up -d
   ```
   *Perintah ini akan menyalakan kontainer PostgreSQL (`chat_db`) dan FastAPI backend (`chat_backend`).*

2. **Jalankan Frontend secara lokal**  
   Buka terminal baru, navigasikan ke direktori `client`, lalu instal dependensi dan mulai server pengembangan:
   ```bash
   cd client
   pnpm install
   pnpm dev
   ```

3. **Akses Aplikasi**  
   Buka peramban (browser) dan akses alamat `http://localhost:5173`.

### Menjalankan Pengujian (Unit Tests)

- **Test Backend (JWT Library):**
  ```bash
  cd server
  source venv/bin/activate
  pytest tests/test_jwt_core.py -v -s
  ```
- **Test Frontend (HMAC Crypto):**
  ```bash
  cd client
  pnpm vitest run src/services/crypto/hmac.spec.js
  ```

## Environment / Configuration yang Digunakan

Proyek ini menggunakan variabel lingkungan (environment variables) untuk mengelola kredensial dan konfigurasi secara aman.

**Konfigurasi Backend (`server/.env`)**
```env
# Database Credentials
DB_USER=user_kripto
DB_PASSWORD=rahasia
DB_NAME=chat_db
DB_PORT=5432
DB_HOST=localhost # atau 'db' jika dijalankan di dalam network Docker

# JWT Configuration
JWT_ALGORITHM=ES256

# JWT ECDSA Keys (dihasilkan melalui skrip generate_keys.py)
JWT_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY----- ... -----END EC PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----"
```

*Catatan: Variabel di atas juga dibaca langsung oleh berkas `docker-compose.yml` untuk inisialisasi basis data.*
