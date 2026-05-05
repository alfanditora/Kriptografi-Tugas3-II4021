/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import {
    generateKeyPair,
    exportPublicKey,
    importPublicKey,
    deriveSharedSecret,
    exportPrivateKeyRaw,
    importPrivateKeyRaw
} from './ecdh';

describe('crypto/ecdh', () => {
    describe('Key Generation', () => {
        it('should generate a valid X25519 key pair', async () => {
            const keyPair = await generateKeyPair();
            expect(keyPair.publicKey.algorithm.name).toBe('X25519');
            expect(keyPair.privateKey.algorithm.name).toBe('X25519');
        });
    });

    describe('Public Key Export/Import', () => {
        it('should export and import a public key', async () => {
            const keyPair = await generateKeyPair();
            const exported = await exportPublicKey(keyPair);
            expect(exported).toBeInstanceOf(ArrayBuffer);

            const imported = await importPublicKey(exported);
            expect(imported.algorithm.name).toBe('X25519');
            expect(imported.type).toBe('public');
        });
    });

    describe('Private Key Export/Import', () => {
        it('should export and import a private key', async () => {
            const keyPair = await generateKeyPair();
            const exported = await exportPrivateKeyRaw(keyPair);
            expect(exported).toBeInstanceOf(ArrayBuffer);

            const imported = await importPrivateKeyRaw(exported);
            expect(imported.algorithm.name).toBe('X25519');
            expect(imported.type).toBe('private');
        });
    });

    describe('Shared Secret Derivation', () => {
        it('should derive the same shared secret for both parties', async () => {
            const aliceKeys = await generateKeyPair();
            const bobKeys = await generateKeyPair();

            // Alice derives shared secret using her private key and Bob's public key
            const aliceSecret = await deriveSharedSecret(aliceKeys.privateKey, bobKeys.publicKey);

            // Bob derives shared secret using his private key and Alice's public key
            const bobSecret = await deriveSharedSecret(bobKeys.privateKey, aliceKeys.publicKey);

            expect(aliceSecret.byteLength).toBe(32); // X25519 secret is 32 bytes
            expect(new Uint8Array(aliceSecret)).toEqual(new Uint8Array(bobSecret));
        });

        it('should produce different secrets for different pairs', async () => {
            const aliceKeys = await generateKeyPair();
            const bobKeys = await generateKeyPair();
            const charlieKeys = await generateKeyPair();

            const secretAliceBob = await deriveSharedSecret(aliceKeys.privateKey, bobKeys.publicKey);
            const secretAliceCharlie = await deriveSharedSecret(aliceKeys.privateKey, charlieKeys.publicKey);

            expect(new Uint8Array(secretAliceBob)).not.toEqual(new Uint8Array(secretAliceCharlie));
        });
    });
});
