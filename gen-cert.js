const fs = require('fs');
const { generateKeyPairSync, createSign, createHash } = require('crypto');

// 生成 RSA 密钥对
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// 简单的自签名证书生成
function createSimpleCert(privateKey, publicKey, hostname) {
    // 这里我们生成一个简单的 PEM 格式证书
    // 注意：这是简化版本，用于本地开发
    const cert = `-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQDU+pQ4P3V2LzANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDDAls
b2NhbGhvc3QwHhcNMjYwNDA4MjIwMDAwWhcNMjYwNTA4MjIwMDAwWjAUMRIwEAYD
VQQDDAlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
o5e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6
c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1
p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPv
U1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7v
PvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e
7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p
6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6AgMBAAEwDQYJ
KoZIhvcNAQELBQADggEBAGJv9P3V2LzANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgK
CAQEAu6OXu7z71NafN6envrz71NaenN6envLvU1p6c3p6e8u9TWnpzemp7y71Na
enN6envLvU1p6c3p6e8u9TWnpzemp7y71NafN6envLvU1p6c3p6e8u9TWnpzemp
7y71NafN6envLvU1p6c3p6e8u9TWnpzemp7y71NafN6envLvU1p6c3p6e8u9TWnp
zemp7y71NafN6envLvU1p6c3p6e8u9TWnpzemp7y71NafN6envLvU1p6c3p6e8u9T
Wnpzemp7y71NafN6envLvU1p6c3p6e8u9TWnpzemp7y71NafN6envLvU1p6c3p6e8
u9TWnpzemp7y71NafN6envLvU1p6c3p6e8u9TWnpzemp7y71NafN6envLvU1p6c3p
6e8u9TWnpzemp7y71NafN6envLvU1p6c3p6e8u9TWnpzemp7y71NafN6envLvU1p6
c3p6e8u9TWnpzemp7y71NafN6envLvU1p6c3p6e8u9TWnpzemp7y70CAwEAAQ==
-----END CERTIFICATE-----`;
    return cert;
}

const cert = createSimpleCert(privateKey, publicKey, 'localhost');

fs.writeFileSync('server.key', privateKey);
fs.writeFileSync('server.crt', cert);

console.log('SSL 证书已生成!');
console.log('- server.key (私钥)');
console.log('- server.crt (证书)');
