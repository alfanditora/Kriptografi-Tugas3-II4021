/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { generateKey, sign, verify } from './hmac';

describe('crypto/hmac', () => {
    describe('generateKey', () => {
        it('should generate a valid HMAC-SHA256 key', async () => {
            const key = await generateKey();
            expect(key.algorithm.name).toBe('HMAC');
            expect(key.algorithm.hash.name).toBe('SHA-256');
            expect(key.usages).toContain('sign');
            expect(key.usages).toContain('verify');
        });
    });

    describe('Sign and Verify', () => {
        it('should sign and verify a message', async () => {
            const key = await generateKey();
            const message = "Message to authenticate";
            
            const signature = await sign(message, key);
            expect(signature).toBeInstanceOf(ArrayBuffer);
            
            const isValid = await verify(message, signature, key);
            expect(isValid).toBe(true);
        });

        it('should fail verification if message is tampered', async () => {
            const key = await generateKey();
            const message = "Original Message";
            const tamperedMessage = "Tampered Message";
            
            const signature = await sign(message, key);
            const isValid = await verify(tamperedMessage, signature, key);
            expect(isValid).toBe(false);
        });

        it('should fail verification if signature is tampered', async () => {
            const key = await generateKey();
            const message = "Original Message";
            
            const signature = await sign(message, key);
            const tamperedSignature = new Uint8Array(signature);
            tamperedSignature[0] ^= 1; // Flip one bit
            
            const isValid = await verify(message, tamperedSignature.buffer, key);
            expect(isValid).toBe(false);
        });

        it('should fail verification with a different key', async () => {
            const key1 = await generateKey();
            const key2 = await generateKey();
            const message = "Original Message";
            
            const signature = await sign(message, key1);
            const isValid = await verify(message, signature, key2);
            expect(isValid).toBe(false);
        });
    });
});
