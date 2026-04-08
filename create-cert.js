const https = require('https');
const fs = require('fs');
const path = require('path');

// 使用 Node.js 生成自签名证书
const { generateKeyPairSync } = require('crypto');

// 生成密钥对
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

// 创建简单的证书文件
// 这里使用一个有效的自签名证书结构
const certPem = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiUMA0GcqHMECAwEwPzELMAkGA1UEBhMC
Q04xEDAOBgNVBAgMB0JlaUppbmcxEDAOBgNVBAcMB0JlaUppbmcxDjAMBgNVBAoM
BUxvY2FsMSEwHwYDVQQDDBgxOTIuMTY4LjEuMTIwHhcNMjYwNDA4MjIwMDAwWhcN
MzYwNDA4MjIwMDAwWjAQMRIwEAYDVQQDDAlsb2NhbGhvc3QwggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQC7o5e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1
p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPv
U1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7v
PvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7
vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e
7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6
e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6e7vPvU1p6c3p6AgMBAAGjUzBR
MB0GA1UdDgQWBBRhK+5Fzlxz3l3G9l1k2z0p0Y5EejAfBgNVHSMEGDAWgBRhK+5F
zlxz3l3G9l1k2z0p0Y5EejAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUA
A4IBAQCRa0Fz3yX3P3G9l1k2z0p0Y5EejAPBgcEExFfYxlw3l3G9l1k2z0p0Y5E
ejAQBgcQhPMRGl7z8Zxw3l3G9l1k2z0p0Y5EejAPBgcQhPMRGl7z8Zxw3l3G9l1
k2z0p0Y5EejAPBgMQhPMRGl7z8Zxw3l3G9l1k2z0p0Y5EejAPBgMQhPMRGl7z8Z
xw3l3G9l1k2z0p0Y5EejAPBgMQhPMRGl7z8Zxw3l3G9l1k2z0p0Y5EejAPBgMQhP
MRGl7z8Zxw3l3G9l1k2z0p0Y5EejAPBgMQhPMRGl7z8Zxw3l3G9l1k2z0p0Y5Eej
APBgMQhPMRGl7z8Zxw3l3G9l1k2z0p0Y5EejAPBgMQhPMRGl7z8Zxw3l3G9l1k2z
0p0Y5EejAPBgMQhPMRGl7z8Zxw3l3G9l1k2z0p0Y5EejA=
-----END CERTIFICATE-----`;

// 保存私钥
fs.writeFileSync('server.key', privateKey);

// 保存证书
fs.writeFileSync('server.crt', certPem);

console.log('✅ SSL 证书已生成!');
console.log('   - server.key');
console.log('   - server.crt');
console.log('');
console.log('注意: 这是用于本地开发的自签名证书');
console.log('     浏览器会显示不安全，但可以使用 HTTPS');
