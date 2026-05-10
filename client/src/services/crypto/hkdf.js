/**
 * [!!CREATIVE] Menurunkan dua kunci sekaligus (AES & HMAC) untuk enkripsi dan autentikasi.
 * [!!SELF_IMPLEMENTED] Menggunakan info string terpisah untuk pemisahan domain (domain separation).
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