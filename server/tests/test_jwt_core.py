import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import time
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from security.jwt_core import sign, verify

def generate_key_pair(curve=ec.SECP256R1()):
    """Fungsi bantuan untuk membuat key EC berformat PEM."""
    private_key = ec.generate_private_key(curve)
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    pub_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    return priv_pem, pub_pem

@pytest.fixture
def ec_keys():
    return generate_key_pair()

def test_happy_path(ec_keys):
    priv_key, pub_key = ec_keys
    header = {"alg": "ES256", "typ": "JWT"}
    claims = {"iss": "university", "exp": int(time.time()) + 3600}
    payload = {"role": "student", "iss": "overwritten_iss"}
    
    token = sign(header, claims, payload, priv_key)
    
    decoded = verify(token, pub_key, priv_key)
    print(f"\n[+] Uji 1 Berhasil: Token diverifikasi dengan public key yang benar.")
    print(f"[+] Payload yang terbaca: {decoded['payload']}")
    assert decoded["header"] == header
    assert decoded["payload"]["role"] == "student"
    assert decoded["payload"]["iss"] == "university" 
    assert "signature" in decoded
    assert isinstance(decoded["signature"], str)

def test_invalid_header_missing_alg(ec_keys):
    priv_key, pub_key = ec_keys
    header = {"typ": "JWT"}
    claims = {}
    payload = {}
    
    with pytest.raises(ValueError, match="Header must contain 'alg'"):
        sign(header, claims, payload, priv_key)

def test_invalid_token_format(ec_keys):
    priv_key, pub_key = ec_keys
    token = "invalid.token.format.here"
    with pytest.raises(ValueError, match="Invalid JWT format") as exc_info:
        verify(token, pub_key, priv_key)
    print(f"\n[+] Uji 3 Berhasil: Sistem melempar error '{exc_info.value}' karena format token tidak valid.")

def test_wrong_signature(ec_keys):
    priv_key1, pub_key1 = ec_keys
    priv_key2, pub_key2 = generate_key_pair()
    
    header = {"alg": "ES256", "typ": "JWT"}
    token = sign(header, {}, {"data": "secret"}, priv_key1)
    
    with pytest.raises(ValueError, match="Invalid signature") as exc_info:
        verify(token, pub_key2, priv_key2)
    print(f"\n[+] Uji 2 Berhasil: Verifikasi dengan public key yang salah menghasilkan error '{exc_info.value}'.")

def test_expired_token(ec_keys):
    priv_key, pub_key = ec_keys
    header = {"alg": "ES256", "typ": "JWT"}
    claims = {"exp": int(time.time()) - 3600} 
    token = sign(header, claims, {}, priv_key)
    
    with pytest.raises(ValueError, match="Token is expired") as exc_info:
        verify(token, pub_key, priv_key)
    print(f"\n[+] Uji 4 Berhasil: Token ditolak dengan error '{exc_info.value}'.")
        
    decoded = verify(token, pub_key, priv_key, options={"ignoreExp": True})
    print(f"[+] Token berhasil dibaca dengan opsi ignore: {decoded['payload']}")
    assert decoded["payload"]["exp"] == claims["exp"]

def test_mismatched_iss_or_aud(ec_keys):
    priv_key, pub_key = ec_keys
    header = {"alg": "ES256", "typ": "JWT"}
    claims = {"iss": "good_issuer", "aud": "good_audience"}
    token = sign(header, claims, {}, priv_key)
    
    with pytest.raises(ValueError, match="Issuer mismatch"):
        verify(token, pub_key, priv_key, options={"iss": "bad_issuer"})
        
    with pytest.raises(ValueError, match="Audience mismatch"):
        verify(token, pub_key, priv_key, options={"aud": "bad_audience"})
