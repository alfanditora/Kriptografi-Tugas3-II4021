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

Proyek ini telah dikemas sepenuhnya menggunakan Docker untuk memudahkan instalasi dan eksekusi seluruh komponen (Frontend, Backend, dan Database). Pastikan sudah menginstal **Docker** dan **Docker Compose** di perangkat.

### Menjalankan Menggunakan Docker

1. **Persiapan Environment**  
   Salin file `.env.example` menjadi `.env` di root direktori dan sesuaikan konfigurasinya jika diperlukan.
   ```bash
   cp .env.example .env
   ```

2. **Jalankan Seluruh Layanan**  
   Di terminal (pada *root* direktori proyek), jalankan perintah:
   ```bash
   docker-compose up --build -d
   ```
   *Perintah ini akan membangun image dan menyalakan kontainer untuk Database (`chat_db`), Backend (`chat_backend`), dan Frontend (`chat_client`).*

3. **Akses Aplikasi**  
   Setelah semua kontainer berjalan, akses aplikasi melalui peramban (browser):
   - **Frontend:** `http://localhost:5173`
   - **Backend API Docs:** `http://localhost:8000/docs`

### Menjalankan Secara Lokal (Tanpa Docker)

Jika ingin menjalankan untuk keperluan pengembangan (development) tanpa Docker:

1. **Backend:**
   ```bash
   cd server
   # Buat venv dan install requirements
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd client
   pnpm install
   pnpm dev
   ```

### Menjalankan Pengujian (Unit Tests)

- **Test Backend (JWT Library):**
  ```bash
  cd server
  pytest tests/test_jwt_core.py -v -s
  ```
- **Test Frontend (Crypto Services):**
  ```bash
  cd client
  pnpm vitest run
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

**Konfigurasi Frontend (`client/.env.local`)**
```env
# URL API Backend
VITE_API_URL=http://localhost:8000

# Nama Aplikasi
VITE_APP_NAME=SEChatbox

# Mode Mock API (set ke true jika ingin mencoba tanpa backend)
VITE_USE_MOCK_API=false
```

*Catatan: Variabel backend juga dibaca langsung oleh berkas `docker-compose.yml` untuk inisialisasi basis data.*
