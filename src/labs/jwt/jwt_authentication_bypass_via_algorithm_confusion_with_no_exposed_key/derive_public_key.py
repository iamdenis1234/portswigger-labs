import sys
import json
import base64
from gmpy2 import mpz, gcd, c_div
from Crypto.Hash import SHA256, SHA384, SHA512
from Crypto.Signature import (
    pkcs1_15,
)  # god bless http://ratmirkarabut.com/articles/ctf-writeup-google-ctf-quals-2017-rsa-ctf-challenge/
import asn1tools
import binascii


def b64urldecode(b64):
    return base64.urlsafe_b64decode(b64 + ("=" * (len(b64) % 4)))


def b64urlencode(m):
    return base64.urlsafe_b64encode(m).strip(b"=")


def bytes2mpz(b):
    return mpz(int(binascii.hexlify(b), 16))


def der2pem(der, token="RSA PUBLIC KEY"):
    der_b64 = base64.b64encode(der).decode("ascii")

    lines = [der_b64[i : i + 64] for i in range(0, len(der_b64), 64)]
    return "-----BEGIN %s-----\n%s\n-----END %s-----\n" % (
        token,
        "\n".join(lines),
        token,
    )


# e=mpz(65537) # Can be a couple of other common values

jwt0 = sys.argv[1]
jwt1 = sys.argv[2]

alg0 = json.loads(b64urldecode(jwt0.split(".")[0]))
alg1 = json.loads(b64urldecode(jwt1.split(".")[0]))

if not alg0["alg"].startswith("RS") or not alg1["alg"].startswith("RS"):
    raise Exception("Not RSA signed tokens!")
if alg0["alg"] == "RS256":
    HASH = SHA256
elif alg0["alg"] == "RS384":
    HASH = SHA384
elif alg0["alg"] == "RS512":
    HASH = SHA512
else:
    raise Exception("Invalid algorithm")
jwt0_sig_bytes = b64urldecode(jwt0.split(".")[2])
jwt1_sig_bytes = b64urldecode(jwt1.split(".")[2])
if len(jwt0_sig_bytes) != len(jwt1_sig_bytes):
    raise Exception(
        "Signature length mismatch"
    )  # Based on the mod exp operation alone, there may be some differences!

jwt0_sig = bytes2mpz(jwt0_sig_bytes)
jwt1_sig = bytes2mpz(jwt1_sig_bytes)

jks0_input = ".".join(jwt0.split(".")[0:2])
hash_0 = HASH.new(jks0_input.encode("ascii"))
padded0 = pkcs1_15._EMSA_PKCS1_V1_5_ENCODE(hash_0, len(jwt0_sig_bytes))

jks1_input = ".".join(jwt1.split(".")[0:2])
hash_1 = HASH.new(jks1_input.encode("ascii"))
padded1 = pkcs1_15._EMSA_PKCS1_V1_5_ENCODE(hash_1, len(jwt0_sig_bytes))

m0 = bytes2mpz(padded0)
m1 = bytes2mpz(padded1)

pkcs1 = asn1tools.compile_files("pkcs1.asn", codec="der")
x509 = asn1tools.compile_files("x509.asn", codec="der")

public_keys = []
for e in [mpz(3), mpz(65537)]:
    gcd_res = gcd(pow(jwt0_sig, e) - m0, pow(jwt1_sig, e) - m1)
    for my_gcd in range(1, 100):
        my_n = c_div(gcd_res, mpz(my_gcd))
        if pow(jwt0_sig, e, my_n) == m0:
            pkcs1_pubkey = pkcs1.encode(
                "RSAPublicKey", {"modulus": int(my_n), "publicExponent": int(e)}
            )
            x509_der = x509.encode(
                "PublicKeyInfo",
                {
                    "publicKeyAlgorithm": {
                        "algorithm": "1.2.840.113549.1.1.1",
                        "parameters": None,
                    },
                    "publicKey": (pkcs1_pubkey, len(pkcs1_pubkey) * 8),
                },
            )
            public_keys.append(der2pem(x509_der, token="PUBLIC KEY"))

public_key = public_keys[0]
if len(public_keys) == 2:
    public_key = public_keys[1]

print(public_key, end="")

# Test values:
# eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJqb2UiLCJleHAiOjEzMDA4MTkzODAsImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.IDcgYnWIJ0my4FurSqfiAAbYBz2BfImT-uSqKKnk-JfncL_Nreo8Phol1KNn9fK0ZmVfcvHL-pUvVUBzI5NrJNCFMiyZWxS7msB2VKl6-jAXr9NqtVjIDyUSr_gpk51xSzHiBPVAnQn8m1Dg3dR0YkP9b5uJ70qpZ37PWOCKYAIfAhinDA77RIP9q4ImwpnJuY3IDuilDKOq9bsb6zWB8USz0PAYReqWierdS4TYAbUFrhuGZ9mPgSLRSQVtibyNTSTQYtfghYkmV9gWyCJUVwMGCM5l1xlylHYiioasBJA1Wr_NAf_sr4G8OVrW1eO01MKhijpaE8pR6DvPYNrTMQ eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJqb2UiLCJleHAiOjEzMDA4MTkzODEsImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.AH-6ZBGA38IjQdBWbc9mPSPwdHGBcNUw1fT-FhhRA-DnX7A7Ecyaip0jt7gOkuvlXfSBXC91DU6FH7rRcnwgs474jgWCAQm6k5hOngOIce_pKQ_Pk1JU_jFKiKzm668htfG06p9caWa-NicxBp42HKB0w9RRBOddnfWk65d9JTI89clgoLxxz7kbuZIyWAh-Cp1h3ckX7XZmknTNqncq4Y2_PSlcTsJ5aoIL7pIgFQ89NkaHImALYI7IOS8nojgCJnJ74un4F6pzt5IQyvFPVXeODPf2UhMEIEyX3GEcK3ryrD_DciJCze3qjtcjR1mBd6zvAGOUtt6XHSY7UHJ3gg
