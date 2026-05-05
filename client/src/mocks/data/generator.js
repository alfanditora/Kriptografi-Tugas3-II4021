import * as crypto from '../../services/crypto';

export async function generateMockUser(email, password = 'password123') {
  const regData = await crypto.prepareRegistrationData(email, password);
  
  return {
    id: `usr_${Math.random().toString(36).substr(2, 9)}`,
    email: email,
    password: password,
    crypto: {
      publicKey: crypto.arrayBufferToBase64(regData.publicKey),
      encryptedPrivateKey: {
        ciphertext: crypto.arrayBufferToBase64(regData.encryptedPrivateKey),
        iv: crypto.arrayBufferToBase64(regData.iv),
        alg: "AES-256-CBC"
      },
      kdf: {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: crypto.arrayBufferToBase64(regData.kdfSalt),
        iterations: regData.kdfIterations
      }
    }
  };
}
