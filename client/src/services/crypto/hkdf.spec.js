/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { deriveChatKeys } from './hkdf';
import { encrypt, decrypt } from './aes';

describe('crypto/hkdf', () => {
    describe('deriveChatKeys', () => {
        const sharedSecret = new Uint8Array(32).fill(1).buffer;
        const salt = new Uint8Array(32).fill(0).buffer;
        const infoPrefix = "user1@test.com-user2@test.com";

        it('should derive both AES and HMAC keys', async () => {
            const { aesKey, hmacKey } = await deriveChatKeys(sharedSecret, salt, infoPrefix);
            
            expect(aesKey.algorithm.name).toBe('AES-CBC');
            expect(aesKey.algorithm.length).toBe(256);
            expect(hmacKey.algorithm.name).toBe('HMAC');
            expect(hmacKey.algorithm.hash.name).toBe('SHA-256');
        });

        it('should produce consistent keys for same inputs', async () => {
            const keys1 = await deriveChatKeys(sharedSecret, salt, infoPrefix);
            const keys2 = await deriveChatKeys(sharedSecret, salt, infoPrefix);
            
            const message = "Consistency Test";
            const { ciphertext, iv } = await encrypt(message, keys1.aesKey);
            const decrypted = await decrypt(ciphertext, iv, keys2.aesKey);
            
            expect(new TextDecoder().decode(decrypted)).toBe(message);
        });

        it('should produce different keys for different infoPrefix', async () => {
            const keys1 = await deriveChatKeys(sharedSecret, salt, "prefix1");
            const keys2 = await deriveChatKeys(sharedSecret, salt, "prefix2");
            
            const message = "Difference Test";
            const { ciphertext, iv } = await encrypt(message, keys1.aesKey);
            
            await expect(decrypt(ciphertext, iv, keys2.aesKey)).rejects.toThrow();
        });
    });
});
