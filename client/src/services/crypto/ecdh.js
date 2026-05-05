export async function generateKeyPair() {
    /**
     * Menghasilkan pasangan kunci (key pair) X25519 untuk protokol ECDH.
     * @returns {Promise<Object>} Objek yang berisi kunci publik (publicKey) dan kunci privat (privateKey).
     */
    
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "X25519"
        },
        true,
        ["deriveBits"]
    );
    return keyPair;
}

export async function exportPublicKey(key) {
    /**
     * Mengekspor kunci publik ke dalam format SPKI (Subject Public Key Info).
     * @param {Object} key - Objek yang mengandung kunci publik (CryptoKey).
     * @returns {Promise<ArrayBuffer>} Kunci publik dalam format SPKI.
     */
    
    const spki = await crypto.subtle.exportKey("spki", key.publicKey);
    return spki;
}

export async function importPublicKey(spki) {
    /**
     * Mengimpor kunci publik dari format SPKI.
     * @param {ArrayBuffer} spki - Kunci publik dalam format SPKI.
     * @returns {Promise<Object>} Objek kunci publik (CryptoKey).
     */
    
    const key = await crypto.subtle.importKey("spki", spki, { name: "X25519" }, true, []);
    return key;
}

export async function deriveSharedSecret(privateKey, publicKey) {
    /**
     * Menurunkan shared secret menggunakan protokol ECDH.
     * @param {Object} privateKey - Kunci privat (CryptoKey).
     * @param {Object} publicKey - Kunci publik lawan bicara (CryptoKey).
     * @returns {Promise<ArrayBuffer>} Shared secret yang dihasilkan.
     */
    
    const sharedSecret = await crypto.subtle.deriveBits(
        {
            name: "X25519",
            public: publicKey
        },
        privateKey,
        256
    );
    return sharedSecret;
}

export async function exportPrivateKeyRaw(key) {
    /**
     * Mengekspor kunci privat ke dalam format PKCS#8.
     * @param {Object} key - Objek yang mengandung kunci privat (CryptoKey).
     * @returns {Promise<ArrayBuffer>} Kunci privat dalam format PKCS#8.
     */
    
    const pkcs8 = await crypto.subtle.exportKey("pkcs8", key.privateKey);
    return pkcs8;
}

export async function importPrivateKeyRaw(pkcs8) {
    /**
     * Mengimpor kunci privat dari format PKCS#8.
     * @param {ArrayBuffer} pkcs8 - Kunci privat dalam format PKCS#8.
     * @returns {Promise<Object>} Objek kunci privat (CryptoKey).
     */
    
    const key = await crypto.subtle.importKey("pkcs8", pkcs8, { name: "X25519" }, true, ["deriveBits"]);
    return key;
}
