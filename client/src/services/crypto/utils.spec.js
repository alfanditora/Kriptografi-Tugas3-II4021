import { describe, it, expect } from 'vitest';
import {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    stringToArrayBuffer
} from './utils';

describe('crypto/utils', () => {
    describe('Base64 and ArrayBuffer conversion', () => {
        it('should convert ArrayBuffer to Base64 and back', () => {
            const data = new Uint8Array([1, 2, 3, 4, 5]);
            const base64 = arrayBufferToBase64(data.buffer);
            const decoded = base64ToArrayBuffer(base64);
            
            expect(new Uint8Array(decoded)).toEqual(data);
        });

        it('should handle empty buffers', () => {
            const empty = new ArrayBuffer(0);
            const base64 = arrayBufferToBase64(empty);
            expect(base64).toBe('');
            
            const decoded = base64ToArrayBuffer('');
            expect(decoded.byteLength).toBe(0);
        });
    });

    describe('stringToArrayBuffer', () => {
        it('should convert string to ArrayBuffer', () => {
            const str = 'Hello World';
            const buffer = stringToArrayBuffer(str);
            const view = new Uint8Array(buffer);
            
            // "Hello World" in UTF-8
            const expected = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
            expect(view).toEqual(expected);
        });
    });
});
