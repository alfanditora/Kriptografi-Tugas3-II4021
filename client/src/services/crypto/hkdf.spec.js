/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { deriveKeyFromSharedSecret, generateSalt } from './hkdf';

import { encrypt, decrypt } from './aes';

describe('crypto/hkdf', () => {
    describe('generateSalt', () => {
        it('should generate a 32-byte salt', async () => {
            const salt = await generateSalt();
            expect(salt.byteLength).toBe(32);
        });
    });

    describe('deriveKeyFromSharedSecret', () => {
        it('should derive an AES-CBC 256-bit key', async () => {
            const sharedSecret = new Uint8Array(32).fill(1).buffer;
            const salt = await generateSalt();
            const info = "test_info";
            
            const key = await deriveKeyFromSharedSecret(sharedSecret, salt, info);
            
            expect(key.algorithm.name).toBe('AES-CBC');
            expect(key.algorithm.length).toBe(256);
            expect(key.usages).toContain('encrypt');
            expect(key.usages).toContain('decrypt');
        });

        it('should produce the same functional key for same inputs', async () => {
            const sharedSecret = new Uint8Array(32).fill(2).buffer;
            const salt = new Uint8Array(32).fill(3).buffer;
            const info = "stable_info";
            
            const key1 = await deriveKeyFromSharedSecret(sharedSecret, salt, info);
            const key2 = await deriveKeyFromSharedSecret(sharedSecret, salt, info);
            
            const message = "Consistency Test";
            const { ciphertext, iv } = await encrypt(message, key1);
            
            // Should be able to decrypt with key2
            const decrypted = await decrypt(ciphertext, iv, key2);
            expect(new TextDecoder().decode(decrypted)).toBe(message);
        });

        it('should produce different functional keys for different info', async () => {
            const sharedSecret = new Uint8Array(32).fill(4).buffer;
            const salt = new Uint8Array(32).fill(5).buffer;
            
            const key1 = await deriveKeyFromSharedSecret(sharedSecret, salt, "info1");
            const key2 = await deriveKeyFromSharedSecret(sharedSecret, salt, "info2");
            
            const message = "Difference Test";
            const { ciphertext, iv } = await encrypt(message, key1);
            
            // Should fail to decrypt with key2
            await expect(decrypt(ciphertext, iv, key2)).rejects.toThrow();
        });
    });
});
