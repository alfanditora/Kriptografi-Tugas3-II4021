/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { encrypt, decrypt } from './aes';

describe('crypto/aes', () => {
    let key;

    beforeEach(async () => {
        key = await crypto.subtle.generateKey(
            {
                name: "AES-CBC",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
    });

    describe('Encryption and Decryption', () => {
        it('should encrypt and decrypt an ArrayBuffer', async () => {
            const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
            const { ciphertext, iv } = await encrypt(data, key);
            
            expect(ciphertext).toBeInstanceOf(ArrayBuffer);
            expect(iv).toBeInstanceOf(ArrayBuffer);

            const decrypted = await decrypt(ciphertext, iv, key);
            expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(data));
        });

        it('should encrypt and decrypt a string', async () => {
            const message = "Secret Message";
            const { ciphertext, iv } = await encrypt(message, key);
            
            expect(ciphertext).toBeInstanceOf(ArrayBuffer);
            expect(iv).toBeInstanceOf(ArrayBuffer);

            const decrypted = await decrypt(ciphertext, iv, key);
            const decoded = new TextDecoder().decode(decrypted);
            expect(decoded).toBe(message);
        });

        it('should fail to decrypt with wrong key', async () => {
            const message = "Secret Message";
            const { ciphertext, iv } = await encrypt(message, key);
            
            const wrongKey = await crypto.subtle.generateKey(
                { name: "AES-CBC", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );

            await expect(decrypt(ciphertext, iv, wrongKey)).rejects.toThrow();
        });
    });
});
