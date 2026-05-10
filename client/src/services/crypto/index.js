import { generateKeyPair, exportPublicKey, exportPrivateKeyRaw } from './ecdh';
import { deriveKeyFromPassword, generateSalt } from './kdf';
import { encrypt, decrypt } from './aes';

export * from './utils';
export * from './ecdh';
export { deriveKeyFromPassword, generateSalt } from './kdf';
export * from './aes';
export { deriveChatKeys } from './hkdf';
export * from './hmac';

/**
 * Menyiapkan seluruh data kriptografi yang diperlukan untuk pendaftaran pengguna baru.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Data registrasi.
 */
export async function prepareRegistrationData(email, password) {
    const keyPair = await generateKeyPair();
    const publicKey = await exportPublicKey(keyPair);
    const privateKeyRaw = await exportPrivateKeyRaw(keyPair);
    
    const kdfSalt = await generateSalt();
    const kdfIterations = 100000;
    
    const { key: aesKey } = await deriveKeyFromPassword(password, kdfSalt, kdfIterations);
    const { ciphertext: encryptedPrivateKey, iv } = await encrypt(privateKeyRaw, aesKey);
    
    return {
        email,
        publicKey,
        encryptedPrivateKey,
        iv,
        kdfSalt,
        kdfIterations
    };
}

/**
 * Mendekripsi kunci privat menggunakan kata sandi pengguna dan parameter KDF.
 * @param {string} password 
 * @param {ArrayBuffer} encryptedPrivateKey 
 * @param {ArrayBuffer} iv 
 * @param {ArrayBuffer} salt 
 * @param {number} iterations 
 * @returns {Promise<ArrayBuffer>} Kunci privat hasil dekripsi (format PKCS#8).
 */
export async function decryptPrivateKeyRaw(password, encryptedPrivateKey, iv, salt, iterations) {
    const { key: aesKey } = await deriveKeyFromPassword(password, salt, iterations);
    const privateKeyRaw = await decrypt(encryptedPrivateKey, iv, aesKey);
    return privateKeyRaw;
}
