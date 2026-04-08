/**
 * TRTC 签名服务
 * 
 * 此服务用于生成腾讯云 TRTC 的用户签名 (UserSig)
 * 
 * ⚠️ 重要安全说明:
 * SecretKey 用于生成 UserSig，具有用户身份认证权限
 * 严禁将 SecretKey 泄露给任何人，包括前端代码
 * 所有签名生成必须在服务器端完成
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ========== TRTC 配置 ==========
// 请替换为您在腾讯云 TRTC 控制台获取的凭据
const TRTC_CONFIG = {
    appId: process.env.TRTC_APP_ID || 'YOUR_TRTC_APP_ID',
    secretKey: process.env.TRTC_SECRET_KEY || 'YOUR_TRTC_SECRET_KEY'
};

/**
 * 生成 TRTC 用户签名 (UserSig)
 * 
 * @param {string} userId - 用户ID
 * @param {number} roomId - 房间号 (可选)
 * @param {number} expireTime - 签名过期时间 (秒，默认 7 天)
 * @returns {object} - 包含 signature 和 expireTime
 */
function genUserSig(userId, roomId = 0, expireTime = 604800) {
    // 权限票据
    const crypto = require('crypto');
    
    // 当前时间戳 (秒)
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 签名过期时间
    const expireTimeObj = currentTime + expireTime;
    
    // 构造函数
    const userBuf = Buffer.from(userId);
    
    // 拼接签名内容
    const content = new Buffer(JSON.stringify({
        Tech: 'TRTC',
        appId: TRTC_CONFIG.appId,
        userId: userId,
        roomId: roomId,
        timestamp: expireTimeObj,
        random: Math.floor(Math.random() * 1000000)
    }));
    
    // 使用 HMAC-SHA1 签名
    const hmac = crypto.createHmac('sha256', TRTC_CONFIG.secretKey);
    hmac.update(content);
    const signature = hmac.digest('base64');
    
    return {
        signature: signature,
        expireTime: expireTimeObj,
        timestamp: currentTime
    };
}

/**
 * 生成 UserSig (使用 TLSSigAPIv2 兼容算法)
 */
function genUserSigV2(userId, expireTime = 604800) {
    const currentTime = Math.floor(Date.now() / 1000);
    const random = Math.floor(Math.random() * 1000000);
    const expireTimeObj = currentTime + expireTime;
    
    // 拼接签名字符串
    const str = `appId=${TRTC_CONFIG.appId}&userId=${userId}&time=${expireTimeObj}&random=${random}`;
    
    // HMAC-SHA256
    const hmac = crypto.createHmac('sha256', TRTC_CONFIG.secretKey);
    hmac.update(str);
    const signature = hmac.digest('base64');
    
    // 拼接最终签名
    const sigString = Buffer.from(JSON.stringify({
        'TLS.ver': '2.0',
        'TLS.identifier': userId,
        'TLS.appId': parseInt(TRTC_CONFIG.appId),
        'TLS.time': expireTimeObj,
        'TLS.random': random,
        'TLS.signature': signature
    })).toString('base64');
    
    return sigString;
}

// ========== API 路由 ==========

/**
 * 生成签名接口
 * 
 * GET /api/gen-signature?userId=xxx&roomId=123
 */
app.get('/api/gen-signature', (req, res) => {
    const { userId, roomId } = req.query;
    
    if (!userId) {
        return res.status(400).json({
            error: '缺少 userId 参数',
            message: '请提供 userId 参数'
        });
    }
    
    // 验证 appId 配置
    if (TRTC_CONFIG.appId === 'YOUR_TRTC_APP_ID') {
        return res.status(400).json({
            error: '配置错误',
            message: '请在 Railway 环境变量中设置 TRTC_APP_ID 和 TRTC_SECRET_KEY'
        });
    }
    
    try {
        const signature = genUserSigV2(userId);
        
        console.log(`✅ 为用户 ${userId} 生成了签名`);
        
        res.json({
            success: true,
            signature: signature,
            appId: TRTC_CONFIG.appId,
            userId: userId,
            roomId: roomId || null
        });
        
    } catch (error) {
        console.error('签名生成失败:', error);
        res.status(500).json({
            error: '签名生成失败',
            message: error.message
        });
    }
});

/**
 * 健康检查接口
 * 
 * GET /health
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        config: {
            appId: TRTC_CONFIG.appId !== 'YOUR_TRTC_APP_ID' ? 'configured' : 'not configured',
            hasSecretKey: TRTC_CONFIG.secretKey !== 'YOUR_TRTC_SECRET_KEY'
        }
    });
});

/**
 * 获取配置状态
 * 
 * GET /api/config-status
 */
app.get('/api/config-status', (req, res) => {
    res.json({
        appIdConfigured: TRTC_CONFIG.appId !== 'YOUR_TRTC_APP_ID',
        secretKeyConfigured: TRTC_CONFIG.secretKey !== 'YOUR_TRTC_SECRET_KEY',
        message: TRTC_CONFIG.appId === 'YOUR_TRTC_APP_ID' 
            ? '请在 Railway 环境变量中设置 TRTC_APP_ID 和 TRTC_SECRET_KEY'
            : '配置正常'
    });
});

/**
 * 主页
 */
app.get('/', (req, res) => {
    res.json({
        name: 'VoiceCall TRTC Backend',
        version: '1.0.0',
        endpoints: {
            '生成签名': 'GET /api/gen-signature?userId=xxx&roomId=123',
            '健康检查': 'GET /health',
            '配置状态': 'GET /api/config-status'
        }
    });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `路径 ${req.path} 不存在`
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🎙️  VoiceCall TRTC Backend 已启动');
    console.log('');
    console.log(`📡 服务器地址: http://localhost:${PORT}`);
    console.log(`🔧 环境变量检查:`);
    console.log(`   - TRTC_APP_ID: ${TRTC_CONFIG.appId !== 'YOUR_TRTC_APP_ID' ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`   - TRTC_SECRET_KEY: ${TRTC_CONFIG.secretKey !== 'YOUR_TRTC_SECRET_KEY' ? '✅ 已配置' : '❌ 未配置'}`);
    console.log('');
    console.log('📝 API 接口:');
    console.log('   - GET /api/gen-signature?userId=xxx  生成用户签名');
    console.log('   - GET /health                     健康检查');
    console.log('   - GET /api/config-status          配置状态');
    console.log('');
});
