import { stringToArrayBuffer } from './utils';

export async function encrypt(plaintext, key) {
    /**
     * [!SELF_IMPLEMENTED] Menggunakan AES-256-CBC sebagai varian AES yang dipilih.
     * Melakukan enkripsi data menggunakan algoritma AES-256-CBC.
     * @param {ArrayBuffer|string} plaintext - Data asal yang akan dienkripsi.
     * @param {CryptoKey} key - Kunci AES-256.
     * @returns {Promise<Object>} Objek yang berisi ciphertext dan iv.
     */
    
    const data = typeof plaintext === 'string' ? stringToArrayBuffer(plaintext) : plaintext;
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: iv
        },
        key,
        data
    );
    
    return { ciphertext, iv: iv.buffer };
}

export async function decrypt(ciphertext, iv, key) {
    /**
     * Melakukan dekripsi data menggunakan algoritma AES-256-CBC.
     * @param {ArrayBuffer} ciphertext - Data terenkripsi (ciphertext) yang akan didekripsi.
     * @param {ArrayBuffer} iv - Initialization Vector yang digunakan saat enkripsi.
     * @param {CryptoKey} key - Kunci AES-256.
     * @returns {Promise<ArrayBuffer>} Data hasil dekripsi (plaintext).
     */
    
    const plaintext = await crypto.subtle.decrypt(
        {
            name: "AES-CBC",
            iv: iv
        },
        key,
        ciphertext
    );
    return plaintext;
}
