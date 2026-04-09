/**
 * 🎙️ 语音通话信令服务器 + 音频中继
 * 
 * 当 P2P 连接失败时，自动切换到服务器中继模式
 */

const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// 加载SSL证书
let server, wss;
const certPath = path.join(__dirname, 'server.crt');
const keyPath = path.join(__dirname, 'server.key');

const hasSSL = fs.existsSync(certPath) && fs.existsSync(keyPath);

if (hasSSL) {
    const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
    server = https.createServer(httpsOptions, app);
    console.log('🔐 HTTPS 模式已启用');
} else {
    server = http.createServer(app);
    console.log('⚠️  未检测到SSL证书，使用 HTTP 模式');
}

wss = new WebSocket.Server({ server });

// 房间管理
const rooms = new Map();
// 中继模式：存储需要中继的客户端配对
const relayPairs = new Map();

// 获取本机IP
function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// CORS 中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 提供前端页面
const frontendPath = path.join(__dirname, 'public.html');
if (fs.existsSync(frontendPath)) {
    app.get('/', (req, res) => res.sendFile(frontendPath));
    console.log('📄 前端页面已加载: public.html');
} else {
    console.log('⚠️  未找到前端页面 public.html');
}

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        rooms: rooms.size,
        clients: wss.clients.size,
        timestamp: new Date().toISOString()
    });
});

// WebSocket 连接处理
wss.on('connection', (ws, req) => {
    let currentRoom = null;
    let userId = null;
    let isAlive = true;

    console.log(`[${new Date().toLocaleTimeString()}] 新连接: ${req.socket.remoteAddress}`);

    // 心跳机制
    ws.on('pong', () => {
        isAlive = true;
    });

    ws.on('message', (message) => {
        isAlive = true;
        
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
                    
                case 'join':
                    userId = data.userId;
                    currentRoom = data.roomId;
                    
                    if (!rooms.has(currentRoom)) {
                        rooms.set(currentRoom, new Set());
                    }
                    rooms.get(currentRoom).add(ws);
                    
                    ws.userId = userId;
                    ws.roomId = currentRoom;
                    
                    console.log(`[${new Date().toLocaleTimeString()}] ${userId} 加入房间 ${currentRoom}`);
                    
                    broadcast(currentRoom, {
                        type: 'user-joined',
                        userId: userId
                    }, ws);
                    
                    const users = Array.from(rooms.get(currentRoom))
                        .filter(client => client !== ws && client.readyState === WebSocket.OPEN)
                        .map(client => client.userId);
                    
                    ws.send(JSON.stringify({
                        type: 'room-users',
                        users: users
                    }));
                    break;

                // P2P 信令
                case 'offer':
                case 'answer':
                case 'ice-candidate':
                    broadcast(currentRoom, {
                        type: data.type,
                        from: userId,
                        to: data.to,
                        payload: data.payload
                    }, ws);
                    break;

                // 屏幕共享信令（P2P，服务器仅透传）
                case 'screen-offer':
                case 'screen-answer':
                case 'screen-ice':
                    console.log(`[${new Date().toLocaleTimeString()}] 屏幕信令: ${data.type} from=${userId} to=${data.to}`);
                    broadcast(currentRoom, {
                        type: data.type,
                        from: userId,
                        to: data.to,
                        payload: data.payload
                    }, ws);
                    break;

                // 停止屏幕共享通知
                case 'screen-stop':
                    broadcast(currentRoom, {
                        type: 'screen-stop',
                        from: userId
                    }, ws);
                    break;

                // 中继模式：音频数据
                case 'relay-audio':
                    // 将音频数据转发给房间内的其他用户
                    relayAudio(ws, data);
                    break;

                // 请求切换到中继模式
                case 'request-relay':
                    console.log(`[${new Date().toLocaleTimeString()}] ${userId} 请求中继模式`);
                    // 通知对方开启中继
                    broadcast(currentRoom, {
                        type: 'relay-start',
                        from: userId
                    }, ws);
                    break;

                case 'leave':
                    handleLeave(ws);
                    break;
            }
        } catch (error) {
            console.error('消息处理错误:', error);
        }
    });

    ws.on('close', () => {
        handleLeave(ws);
        console.log(`[${new Date().toLocaleTimeString()}] 连接关闭: ${req.socket.remoteAddress}`);
    });

    ws.on('error', (error) => {
        console.error('WebSocket 错误:', error);
    });
});

// 中继音频数据
function relayAudio(senderWs, data) {
    if (!senderWs.roomId) return;
    
    const room = rooms.get(senderWs.roomId);
    if (!room) return;

    for (const client of room) {
        if (client !== senderWs && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'relay-audio',
                from: senderWs.userId,
                audioData: data.audioData,
                timestamp: Date.now()
            }));
        }
    }
}

// 全局心跳检查
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            console.log('心跳超时，终止连接');
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

function broadcast(roomId, message, exclude = null) {
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    const msgStr = JSON.stringify(message);
    
    for (const client of room) {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
            client.send(msgStr);
        }
    }
}

function handleLeave(ws) {
    const currentRoom = ws.roomId;
    if (currentRoom && rooms.has(currentRoom)) {
        const room = rooms.get(currentRoom);
        room.delete(ws);
        
        if (room.size === 0) {
            rooms.delete(currentRoom);
        } else {
            broadcast(currentRoom, {
                type: 'user-left',
                userId: ws.userId
            }, ws);
        }
    }
}

// 启动服务器
server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    
    console.log('');
    console.log('🎙️ VoiceCall 信令服务器已启动 (含音频中继)');
    console.log('');
    console.log('📡 访问地址:');
    console.log(`   🔓 HTTP:  http://localhost:${PORT}`);
    console.log(`   🔓 局域网: http://${localIP}:${PORT}`);
    if (hasSSL) {
        console.log(`   🔐 HTTPS: https://localhost:${HTTPS_PORT}`);
        console.log(`   🔐 局域网: https://${localIP}:${HTTPS_PORT}`);
    }
    console.log('');
    console.log('📱 在浏览器或手机中打开上述地址即可使用');
    console.log('');
});

if (hasSSL) {
    server.listen(HTTPS_PORT, '0.0.0.0', () => {
        const localIP = getLocalIP();
        console.log(`🔐 HTTPS 服务器运行在端口 ${HTTPS_PORT}`);
    });
}
