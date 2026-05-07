import { defineStore } from 'pinia';
import * as crypto from '../services/crypto';

/**
 * Store Pinia untuk mengelola state dan operasi kriptografi pengguna.
 */
export const useCryptoStore = defineStore('crypto', {
  state: () => ({
    publicKey: null,           // Kunci publik dalam format Base64 (untuk dibagikan)
    privateKey: null,          // Objek CryptoKey privat (hanya di memori)
    encryptedPrivateKey: null, // Kunci privat terenkripsi dalam format Base64
    kdfSalt: null,             // Salt untuk PBKDF2 dalam format Base64
    kdfIterations: 100000,     // Jumlah iterasi PBKDF2
    sharedSecrets: {},         // Cache untuk kunci chat { userId: { aesKey, hmacKey } }
    isInitialized: false       // Status apakah kunci privat sudah siap digunakan
  }),

  actions: {

    
    
    /**
     * Menghasilkan pasangan kunci ECDH X25519 baru.
     */
    async generateKeyPair() {
      console.log('[Kripto] Menghasilkan pasangan kunci ECDH X25519 baru...');
      const keyPair = await crypto.generateKeyPair();
      this.privateKey = keyPair.privateKey;
      
      const publicKeyBuffer = await crypto.exportPublicKey(keyPair);
      this.publicKey = crypto.arrayBufferToBase64(publicKeyBuffer);
      console.log('[Kripto] Pasangan kunci berhasil dibuat.');
      console.log('[Kripto] Kunci Publik (Base64):', this.publicKey);
    },

    /**
     * Mengenkripsi kunci privat menggunakan kunci yang diturunkan dari password.
     */
    async encryptPrivateKey(password) {
      if (!this.privateKey) throw new Error("Kunci privat belum dibuat");
      
      console.log('[Kripto] Mengenkripsi kunci privat dengan password...');

      // Siapkan salt dan kunci derivasi
      this.kdfSalt = crypto.arrayBufferToBase64(await crypto.generateSalt());
      console.log('[Kripto] Salt KDF baru:', this.kdfSalt);
      
      const { key: aesKey } = await crypto.deriveKeyFromPassword(
        password, 
        crypto.base64ToArrayBuffer(this.kdfSalt), 
        this.kdfIterations
      );
      console.log('[Kripto] Kunci AES untuk enkripsi kunci privat telah diturunkan menggunakan PBKDF2.');

      // Ekspor kunci privat ke format mentah (PKCS#8)
      const privateKeyRaw = await crypto.exportPrivateKeyRaw({ privateKey: this.privateKey });

      // Enkripsi kunci privat tersebut
      const { ciphertext, iv } = await crypto.encrypt(privateKeyRaw, aesKey);
      
      this.encryptedPrivateKey = {
        ciphertext: crypto.arrayBufferToBase64(ciphertext),
        iv: crypto.arrayBufferToBase64(iv)
      };

      console.log('[Kripto] Kunci privat berhasil dienkripsi.');
      return this.encryptedPrivateKey;
    },

    /**
     * Mendekripsi kunci privat yang tersimpan menggunakan password.
     */
    async decryptPrivateKey(password, encryptedData, saltBase64, iterations) {
      console.log('[Kripto] Memulihkan kunci privat (dekripsi menggunakan password)...');
      const ciphertext = crypto.base64ToArrayBuffer(encryptedData.ciphertext);
      const iv = crypto.base64ToArrayBuffer(encryptedData.iv);
      const salt = crypto.base64ToArrayBuffer(saltBase64);

      // Turunkan kunci AES dari password
      const { key: aesKey } = await crypto.deriveKeyFromPassword(password, salt, iterations);
      console.log('[Kripto] Kunci dekripsi diturunkan dari password menggunakan PBKDF2.');

      // Dekripsi ciphertext menjadi format mentah PKCS#8
      const privateKeyRaw = await crypto.decrypt(ciphertext, iv, aesKey);
      console.log('[Kripto] Ciphertext kunci privat berhasil didekripsi.');

      // Impor kembali menjadi objek CryptoKey
      this.privateKey = await crypto.importPrivateKeyRaw(privateKeyRaw);
      
      this.kdfSalt = saltBase64;
      this.kdfIterations = iterations;
      this.isInitialized = true;
      console.log('[Kripto] Kunci privat berhasil dimuat ke memori.');
    },

    /**
     * Menghitung kunci enkripsi dan MAC untuk percakapan dengan pengguna lain.
     * Menggunakan HKDF untuk menurunkan kedua kunci dari shared secret yang sama.
     */
    async computeSharedSecret(otherUserPublicKeyBase64, otherUserId) {
      if (this.sharedSecrets[otherUserId]) {
        console.log(`[Kripto] Menggunakan kunci percakapan dari cache untuk user: ${otherUserId}`);
        return this.sharedSecrets[otherUserId];
      }

      console.log(`[Kripto] Menjalankan Key Exchange (ECDH) dengan user: ${otherUserId}`);
      console.log('[Kripto] Kunci Publik Lawan:', otherUserPublicKeyBase64);

      // Impor kunci publik lawan bicara
      const otherPubKeyBuffer = crypto.base64ToArrayBuffer(otherUserPublicKeyBase64);
      const otherPubKey = await crypto.importPublicKey(otherPubKeyBuffer);

      // Turunkan shared secret melalui ECDH
      const sharedSecret = await crypto.deriveSharedSecret(this.privateKey, otherPubKey);
      console.log('[Kripto] Shared Secret berhasil dihitung melalui ECDH.');

      // Gunakan HKDF untuk menghasilkan kunci AES dan kunci HMAC dengan info yang berbeda
      const salt = new ArrayBuffer(32); // Zero-filled salt for deterministic derivation
      
      // Sort keys to ensure deterministic infoPrefix regardless of who is sender/receiver
      const sortedKeys = [this.publicKey, otherUserPublicKeyBase64].sort();
      const infoPrefix = sortedKeys.join('-');
      
      console.log('[Kripto] Menurunkan kunci simetris menggunakan HKDF...');
      const { aesKey, hmacKey } = await crypto.deriveChatKeys(sharedSecret, salt, infoPrefix);
      console.log('[Kripto] Kunci AES-256 dan kunci HMAC berhasil diturunkan.');

      this.sharedSecrets[otherUserId] = { aesKey, hmacKey };
      return this.sharedSecrets[otherUserId];
    },

    /**
     * Menghapus kunci privat dari memori (digunakan saat logout).
     */
    clearPrivateKey() {
      this.$reset();
    }
  }
});
