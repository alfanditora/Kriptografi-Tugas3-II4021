import { describe, it, expect } from 'vitest';
import { deriveKeyFromPassword, generateSalt } from './kdf';

describe('crypto/kdf', () => {
    describe('generateSalt', () => {
        it('should generate a 16-byte salt', async () => {
            const salt = await generateSalt();
            expect(salt.byteLength).toBe(16);
        });

        it('should generate different salts', async () => {
            const s1 = new Uint8Array(await generateSalt());
            const s2 = new Uint8Array(await generateSalt());
            expect(s1).not.toEqual(s2);
        });
    });

    describe('deriveKeyFromPassword', () => {
        const password = 'password123';
        let salt;

        it('should derive a key using default iterations (100000)', async () => {
            salt = await generateSalt();
            const result = await deriveKeyFromPassword(password, salt);
            
            expect(result.iterations).toBe(100000);
            expect(result.key.type).toBe('secret');
            expect(result.key.algorithm.name).toBe('AES-CBC');
            expect(result.key.algorithm.length).toBe(256);
            expect(result.key.extractable).toBe(true);
        });

        it('should derive a key using custom iterations', async () => {
            const customIterations = 50000;
            const result = await deriveKeyFromPassword(password, salt, customIterations);
            
            expect(result.iterations).toBe(customIterations);
        });

        it('should produce the same key for same password and salt', async () => {
            const res1 = await deriveKeyFromPassword(password, salt);
            const res2 = await deriveKeyFromPassword(password, salt);
            
            const exported1 = await crypto.subtle.exportKey('raw', res1.key);
            const exported2 = await crypto.subtle.exportKey('raw', res2.key);
            
            expect(new Uint8Array(exported1)).toEqual(new Uint8Array(exported2));
        });

        it('should produce different keys for different passwords', async () => {
            const res1 = await deriveKeyFromPassword('pass1', salt);
            const res2 = await deriveKeyFromPassword('pass2', salt);
            
            const exported1 = await crypto.subtle.exportKey('raw', res1.key);
            const exported2 = await crypto.subtle.exportKey('raw', res2.key);
            
            expect(new Uint8Array(exported1)).not.toEqual(new Uint8Array(exported2));
        });
    });
});
