/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { prepareRegistrationData, decryptPrivateKeyRaw } from './index';

describe('crypto/index - Facade', () => {
    describe('prepareRegistrationData', () => {
        it('should prepare registration data correctly', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            
            const data = await prepareRegistrationData(email, password);
            
            expect(data.email).toBe(email);
            
            // Public Key (SPKI ArrayBuffer)
            expect(data.publicKey).toBeInstanceOf(ArrayBuffer);
            
            // Encrypted Private Key
            expect(data.encryptedPrivateKey).toBeInstanceOf(ArrayBuffer);
            expect(data.iv).toBeInstanceOf(ArrayBuffer);
            
            // KDF parameters
            expect(data.kdfSalt).toBeInstanceOf(ArrayBuffer);
            expect(data.kdfIterations).toBe(100000);
            
            // Verify we can decrypt it back
            const decryptedPrivateKey = await decryptPrivateKeyRaw(
                password,
                data.encryptedPrivateKey,
                data.iv,
                data.kdfSalt,
                data.kdfIterations
            );
            
            expect(decryptedPrivateKey).toBeInstanceOf(ArrayBuffer);
        });
    });
});
