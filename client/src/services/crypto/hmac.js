export async function sign(message, key) {
    /**
     * Membuat tanda tangan digital (signature) pesan menggunakan HMAC.
     * @param {string} message - Pesan yang akan ditandatangani.
     * @param {CryptoKey} key - Kunci HMAC.
     * @returns {Promise<ArrayBuffer>} Tanda tangan (signature) yang dihasilkan.
     */
    
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
    return signature;
}

export async function verify(message, signature, key) {
    /**
     * Memverifikasi tanda tangan digital HMAC dari suatu pesan.
     * @param {string} message - Pesan yang akan diverifikasi.
     * @param {ArrayBuffer} signature - Tanda tangan yang akan diperiksa.
     * @param {CryptoKey} key - Kunci HMAC.
     * @returns {Promise<boolean>} Bernilai true jika tanda tangan valid.
     */
    
    const isValid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(message));
    return isValid;
}