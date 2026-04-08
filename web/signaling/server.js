/**
 * 🎙️ 局域网语音通话 - 信令服务器
 * 
 * 使用 WebSocket 进行 P2P 连接的信令交换
 * 无需外部服务，局域网内直接通信
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

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
                    // 加入房间
                    userId = data.userId;
                    currentRoom = data.roomId;
                    
                    if (!rooms.has(currentRoom)) {
                        rooms.set(currentRoom, new Set());
                    }
                    rooms.get(currentRoom).add(ws);
                    
                    ws.userId = userId;
                    ws.roomId = currentRoom;
                    
                    console.log(`[${new Date().toLocaleTimeString()}] ${userId} 加入房间 ${currentRoom}`);
                    
                    // 通知房间内其他人
                    broadcast(currentRoom, {
                        type: 'user-joined',
                        userId: userId
                    }, ws);
                    
                    // 发送当前房间用户列表
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
                    // 信令转发
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
    console.log(`   本机: http://localhost:${PORT}`);
    console.log(`   局域网: http://${localIP}:${PORT}`);
    console.log('');
    console.log('📱 在浏览器或手机中打开上述地址即可使用');
    console.log('');
});
