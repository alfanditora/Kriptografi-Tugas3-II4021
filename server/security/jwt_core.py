import base64
import json
import time
from typing import Dict, Any, Union
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature, encode_dss_signature
from cryptography.hazmat.primitives import serialization
from cryptography.exceptions import InvalidSignature

def _base64url_encode(data: bytes) -> str:
    """Melakukan encode base64url tanpa padding."""
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _base64url_decode(b64: str) -> bytes:
    """Melakukan decode base64url dengan perbaikan padding otomatis."""
    padding = '=' * (4 - (len(b64) % 4))
    return base64.urlsafe_b64decode(b64 + padding)

def _der_to_raw_signature(der_sig: bytes, curve) -> bytes:
    """Mengubah format signature ASN.1 DER menjadi raw (R, S) sesuai standar JWS RFC 7515."""
    r, s = decode_dss_signature(der_sig)
    key_size = (curve.key_size + 7) // 8
    return r.to_bytes(key_size, byteorder='big') + s.to_bytes(key_size, byteorder='big')

def _raw_to_der_signature(raw_sig: bytes) -> bytes:
    """Mengubah signature raw (R, S) JWS ke format ASN.1 DER untuk kebutuhan library cryptography."""
    half_len = len(raw_sig) // 2
    r = int.from_bytes(raw_sig[:half_len], byteorder='big')
    s = int.from_bytes(raw_sig[half_len:], byteorder='big')
    return encode_dss_signature(r, s)

ALGORITHMS = {
    "ES256": {"hash": hashes.SHA256()},
    "ES384": {"hash": hashes.SHA384()},
    "ES512": {"hash": hashes.SHA512()},
}

def sign(header: dict, claims: dict, payload: dict, privateKey: str) -> str:
    """
    Melakukan proses sign pada payload untuk membuat token JWT format JWS menggunakan algoritma ECDSA.
    """
    if not header or "alg" not in header:
        raise ValueError("Header must contain 'alg'")
    if "typ" not in header or header["typ"] != "JWT":
        raise ValueError("Header must contain 'typ': 'JWT'")
        
    alg = header["alg"]
    if alg not in ALGORITHMS:
        raise ValueError(f"Unsupported algorithm: {alg}")
        
    merged_payload = {}
    if payload:
        merged_payload.update(payload)
    if claims:
        merged_payload.update(claims)
        
    b64_header = _base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    b64_payload = _base64url_encode(json.dumps(merged_payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{b64_header}.{b64_payload}".encode('utf-8')
    
    priv_key = serialization.load_pem_private_key(privateKey.encode('utf-8'), password=None)
    if not isinstance(priv_key, ec.EllipticCurvePrivateKey):
        raise ValueError("Private key must be an EC private key")
        
    hash_algo = ALGORITHMS[alg]["hash"]
    der_signature = priv_key.sign(signing_input, ec.ECDSA(hash_algo))
    
    raw_signature = _der_to_raw_signature(der_signature, priv_key.curve)
    b64_signature = _base64url_encode(raw_signature)
    
    return f"{b64_header}.{b64_payload}.{b64_signature}"


def verify(jwt: str, publickey: str, privateKey: str = None, options: dict = None) -> dict:
    """
    Memverifikasi token JWT format JWS menggunakan public key ECDSA.
    """
    parts = jwt.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")
        
    b64_header, b64_payload, b64_signature = parts
    
    try:
        header = json.loads(_base64url_decode(b64_header).decode('utf-8'))
    except Exception as e:
        raise ValueError("Invalid header encoding") from e
        
    try:
        payload = json.loads(_base64url_decode(b64_payload).decode('utf-8'))
    except Exception as e:
        raise ValueError("Invalid payload encoding") from e
        
    if "alg" not in header:
        raise ValueError("Missing alg in header")
        
    alg = header["alg"]
    if alg not in ALGORITHMS:
        raise ValueError(f"Unsupported algorithm: {alg}")
        
    options = options or {}
    if "algs" in options and alg not in options["algs"]:
        raise ValueError(f"Algorithm {alg} not allowed by options")
        
    pub_key = serialization.load_pem_public_key(publickey.encode('utf-8'))
    if not isinstance(pub_key, ec.EllipticCurvePublicKey):
        raise ValueError("Public key must be an EC public key")
        
    signing_input = f"{b64_header}.{b64_payload}".encode('utf-8')
    
    try:
        raw_signature = _base64url_decode(b64_signature)
        der_signature = _raw_to_der_signature(raw_signature)
    except Exception as e:
        raise ValueError("Invalid signature encoding") from e
    
    hash_algo = ALGORITHMS[alg]["hash"]
    try:
        pub_key.verify(der_signature, signing_input, ec.ECDSA(hash_algo))
    except InvalidSignature:
        raise ValueError("Invalid signature")
        
    now = time.time()
    
    if not options.get("ignoreExp", False):
        if "exp" in payload:
            if payload["exp"] < now:
                raise ValueError("Token is expired")
                
    if not options.get("ignoreNbf", False):
        if "nbf" in payload:
            if payload["nbf"] > now:
                raise ValueError("Token is not yet valid")
                
    if "iss" in options:
        if "iss" not in payload or payload["iss"] != options["iss"]:
            raise ValueError("Issuer mismatch")
            
    if "sub" in options:
        if "sub" not in payload or payload["sub"] != options["sub"]:
            raise ValueError("Subject mismatch")
            
    if "aud" in options:
        aud_opt = options["aud"]
        aud_claim = payload.get("aud")
        if aud_claim is None:
            raise ValueError("Audience missing")
        if isinstance(aud_claim, list):
            if aud_opt not in aud_claim:
                raise ValueError("Audience mismatch")
        else:
            if aud_claim != aud_opt:
                raise ValueError("Audience mismatch")
                
    if "jti" in options:
        if "jti" not in payload or payload["jti"] != options["jti"]:
            raise ValueError("JTI mismatch")
            
    return {
        "header": header,
        "payload": payload,
        "signature": b64_signature
    }
