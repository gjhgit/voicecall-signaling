/**
 * 🎙️ 局域网语音通话 - 信令服务器
 * 
 * 支持 HTTP 和 HTTPS 两种模式
 * HTTPS 解决浏览器麦克风权限限制
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
app.use(express.static(path.join(__dirname, '../frontend')));

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

    console.log(`[${new Date().toLocaleTimeString()}] 新连接: ${req.socket.remoteAddress}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
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
    console.log('🎙️  VoiceCall 信令服务器已启动');
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

// HTTPS 也监听
if (hasSSL) {
    server.listen(HTTPS_PORT, '0.0.0.0', () => {
        const localIP = getLocalIP();
        console.log(`🔐 HTTPS 服务器运行在端口 ${HTTPS_PORT}`);
    });
}
