# SEChatbox Client (Frontend)

Bagian ini berisi source code UI (Frontend) untuk aplikasi SEChatbox, yang dibangun menggunakan **Vue.js 3** dan **Vuetify**.

## Fitur Utama
- **End-to-End Encryption (E2EE):** Semua proses enkripsi dan dekripsi pesan dilakukan di sisi klien menggunakan **Web Crypto API**.
- **Key Management:** Pembangkitan pasangan kunci ECDH (X25519) dan penyimpanan kunci privat terenkripsi di sisi klien.
- **Autentikasi:** Integrasi dengan JWT berbasis ECDSA untuk sesi pengguna yang aman.
- **Real-time Messaging:** Menerima pesan secara langsung menggunakan *Server-Sent Events* (SSE).

## Persiapan Pengembangan (Local Setup)

Jika ingin menjalankan frontend secara terpisah di luar Docker:

### Instalasi Dependensi
Pastikan menggunakan [pnpm](https://pnpm.io/) (bun atau npm juga bisa, tapi disarankan pake pnpm) untuk manajemen paket.
```sh
pnpm install
```

### Menjalankan Server Pengembangan
Menjalankan aplikasi dengan fitur *Hot-Reload* untuk keperluan coding.
```sh
pnpm dev
```

### Linter & Pemeriksaan Kode
Menjalankan ESLint untuk memastikan kualitas kode tetap terjaga.
```sh
pnpm lint
```

## Pengujian (Unit Testing)
Aplikasi ini menggunakan **Vitest** untuk menguji logika kriptografi.
```sh
# Menjalankan seluruh tes
pnpm vitest run

# Menjalankan tes spesifik untuk modul kripto
pnpm vitest run src/services/crypto/
```

## Pengaturan IDE yang Direkomendasikan
- **Editor:** [VS Code](https://code.visualstudio.com/)
- **Ekstensi:** [Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- **Catatan:** Nonaktifkan ekstensi Vetur agar tidak terjadi konflik dengan Volar pada Vue 3.
