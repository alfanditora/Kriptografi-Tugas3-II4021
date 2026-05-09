export async function deriveKeyFromSharedSecret(sharedSecret, salt, info) {
    /**
     * Menurunkan kunci AES-256 dari shared secret menggunakan algoritma HKDF.
     * @param {ArrayBuffer} sharedSecret - Shared secret yang didapat dari ECDH.
     * @param {ArrayBuffer} salt - Salt untuk algoritma HKDF.
     * @param {string} info - Informasi konteks (misal: "message_encryption") yang unik untuk setiap percakapan.
     * @returns {Promise<CryptoKey>} Kunci AES-256 hasil derivasi.
     */
    
    const key = await crypto.subtle.importKey("raw", sharedSecret, { name: "HKDF" }, false, ["deriveKey"]);
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: salt,
            info: new TextEncoder().encode(info)
        },
        key,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
    return derivedKey;
}

export async function generateSalt() {
    /**
     * Menghasilkan salt acak untuk algoritma HKDF.
     * @returns {Promise<ArrayBuffer>} Salt berukuran 32-byte.
     */

    const salt = crypto.getRandomValues(new Uint8Array(32));
    return salt.buffer;
}

/**
 * Menurunkan kunci AES dan HMAC dari shared secret menggunakan HKDF.
 * @param {ArrayBuffer} sharedSecret - Shared secret dari ECDH.
 * @param {ArrayBuffer} salt - Salt untuk HKDF.
 * @param {string} infoPrefix - Prefix untuk info string (e.g., user1_email + user2_email).
 * @returns {Promise<{aesKey: CryptoKey, hmacKey: CryptoKey}>} Objek berisi kedua kunci.
 */
export async function deriveChatKeys(sharedSecret, salt, infoPrefix) {
    // Import shared secret sebagai raw key material
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        sharedSecret,
        { name: "HKDF" },
        false,
        ["deriveKey"]
    );

    // Derive AES key for encryption
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: salt,
            info: new TextEncoder().encode(infoPrefix + "-aes-key")
        },
        keyMaterial,
        { name: "AES-CBC", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    // Derive HMAC key for authentication
    const hmacKey = await crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: salt,
            info: new TextEncoder().encode(infoPrefix + "-hmac-key")
        },
        keyMaterial,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );

    return { aesKey, hmacKey };
}