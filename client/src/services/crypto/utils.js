/**
 * Mengonversi ArrayBuffer menjadi string berformat base64.
 * @param {ArrayBuffer} buffer - Buffer yang akan dikonversi.
 * @returns {string} String dalam format base64.
 */
export function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Mengonversi string base64 kembali menjadi ArrayBuffer.
 * @param {string} base64 - String berformat base64.
 * @returns {ArrayBuffer} Hasil konversi dalam bentuk ArrayBuffer.
 */
export function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Mengonversi string UTF-8 menjadi ArrayBuffer.
 * @param {string} str - String yang akan dikonversi.
 * @returns {ArrayBuffer} Hasil konversi dalam bentuk ArrayBuffer.
 */
export function stringToArrayBuffer(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
}

/**
 * Menghasilkan byte acak yang aman secara kriptografis.
 * @param {number} length - Jumlah byte yang diinginkan.
 * @returns {ArrayBuffer} Buffer berisi byte acak.
 */
export function generateRandomBytes(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array.buffer;
}

/**
 * Menggabungkan beberapa ArrayBuffer menjadi satu.
 * @param {ArrayBuffer[]} buffers - Daftar buffer yang akan digabungkan.
 * @returns {ArrayBuffer} Buffer hasil penggabungan.
 */
export function concatenateBuffers(buffers) {
    const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of buffers) {
        result.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }
    return result.buffer;
}
