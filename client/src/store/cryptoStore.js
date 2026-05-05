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
      const keyPair = await crypto.generateKeyPair();
      this.privateKey = keyPair.privateKey;
      
      const publicKeyBuffer = await crypto.exportPublicKey(keyPair);
      this.publicKey = crypto.arrayBufferToBase64(publicKeyBuffer);
    },

    /**
     * Mengenkripsi kunci privat menggunakan kunci yang diturunkan dari password.
     */
    async encryptPrivateKey(password) {
      if (!this.privateKey) throw new Error("Kunci privat belum dibuat");

      // Siapkan salt dan kunci derivasi
      this.kdfSalt = crypto.arrayBufferToBase64(await crypto.generateSalt());
      const { key: aesKey } = await crypto.deriveKeyFromPassword(
        password, 
        crypto.base64ToArrayBuffer(this.kdfSalt), 
        this.kdfIterations
      );

      // Ekspor kunci privat ke format mentah (PKCS#8)
      const privateKeyRaw = await crypto.exportPrivateKeyRaw({ privateKey: this.privateKey });

      // Enkripsi kunci privat tersebut
      const { ciphertext, iv } = await crypto.encrypt(privateKeyRaw, aesKey);
      
      this.encryptedPrivateKey = {
        ciphertext: crypto.arrayBufferToBase64(ciphertext),
        iv: crypto.arrayBufferToBase64(iv)
      };

      return this.encryptedPrivateKey;
    },

    /**
     * Mendekripsi kunci privat yang tersimpan menggunakan password.
     */
    async decryptPrivateKey(password, encryptedData, saltBase64, iterations) {
      const ciphertext = crypto.base64ToArrayBuffer(encryptedData.ciphertext);
      const iv = crypto.base64ToArrayBuffer(encryptedData.iv);
      const salt = crypto.base64ToArrayBuffer(saltBase64);

      // Turunkan kunci AES dari password
      const { key: aesKey } = await crypto.deriveKeyFromPassword(password, salt, iterations);

      // Dekripsi ciphertext menjadi format mentah PKCS#8
      const privateKeyRaw = await crypto.decrypt(ciphertext, iv, aesKey);

      // Impor kembali menjadi objek CryptoKey
      this.privateKey = await crypto.importPrivateKeyRaw(privateKeyRaw);
      
      this.kdfSalt = saltBase64;
      this.kdfIterations = iterations;
      this.isInitialized = true;
    },

    /**
     * Menghitung kunci enkripsi dan MAC untuk percakapan dengan pengguna lain.
     * Menggunakan HKDF untuk menurunkan kedua kunci dari shared secret yang sama.
     */
    async computeSharedSecret(otherUserPublicKeyBase64, otherUserId) {
      if (this.sharedSecrets[otherUserId]) return this.sharedSecrets[otherUserId];

      // Impor kunci publik lawan bicara
      const otherPubKeyBuffer = crypto.base64ToArrayBuffer(otherUserPublicKeyBase64);
      const otherPubKey = await crypto.importPublicKey(otherPubKeyBuffer);

      // Turunkan shared secret melalui ECDH
      const sharedSecret = await crypto.deriveSharedSecret(this.privateKey, otherPubKey);

      // Gunakan HKDF untuk menghasilkan kunci AES dan kunci HMAC dengan info yang berbeda
      const salt = new ArrayBuffer(32); // Zero-filled salt for deterministic derivation
      const infoPrefix = `${this.publicKey}-${otherUserPublicKeyBase64}`;
      const { aesKey, hmacKey } = await crypto.deriveChatKeys(sharedSecret, salt, infoPrefix);

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
