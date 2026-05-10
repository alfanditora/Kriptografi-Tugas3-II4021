import { stringToArrayBuffer } from './utils';

export async function deriveKeyFromPassword(password, salt, iterations = 600000) {
    /**
     * [!!SELF_IMPLEMENTED] Menggunakan PBKDF2 dengan 600.000 iterasi untuk keamanan optimal.
     * Menurunkan kunci AES-256 dari kata sandi menggunakan algoritma PBKDF2.
     * @param {string} password - Kata sandi sebagai basis derivasi.
     * @param {ArrayBuffer} salt - Salt 16-byte.
     * @param {number} iterations - Jumlah iterasi algoritma PBKDF2.
     * @returns {Promise<Object>} Objek yang berisi kunci (CryptoKey), salt, dan jumlah iterasi.
     */
    
    const passwordBuffer = stringToArrayBuffer(password);
    
    const baseKey = await crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: iterations,
            hash: "SHA-256"
        },
        baseKey,
        {
            name: "AES-CBC",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    return { key, salt, iterations };
}

export async function generateSalt() {
    /**
     * Menghasilkan salt 16-byte secara acak untuk algoritma PBKDF2.
     * @returns {Promise<ArrayBuffer>} Salt berukuran 16-byte.
     */
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return salt.buffer;
}