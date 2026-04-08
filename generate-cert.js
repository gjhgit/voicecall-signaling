// 使用selfsigned生成自签名SSL证书
const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const certDir = __dirname;
const attrs = [{ name: 'commonName', value: '192.168.1.12' }];

async function generateCert() {
    console.log('正在生成SSL证书...');
    
    const pems = await selfsigned.generate(attrs, {
        days: 365,
        algorithm: 'sha256',
        keySize: 2048,
        extensions: [
            {
                name: 'subjectAltName',
                altNames: [
                    { type: 7, ip: '192.168.1.12' },
                    { type: 7, ip: '127.0.0.1' }
                ]
            }
        ]
    });

    console.log('生成的属性:', Object.keys(pems));

    const privateKey = pems.private || pems.privateKey;
    const cert = pems.cert || pems.certificate;

    if (!privateKey || !cert) {
        console.error('生成失败！');
        process.exit(1);
    }

    fs.writeFileSync(path.join(certDir, 'server.key'), privateKey);
    fs.writeFileSync(path.join(certDir, 'server.crt'), cert);

    console.log('✅ SSL证书已生成!');
    console.log('   - server.crt');
    console.log('   - server.key');
}

generateCert().catch(console.error);
