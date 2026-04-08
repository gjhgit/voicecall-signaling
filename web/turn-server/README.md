# Coturn TURN 服务器部署

## 快速部署到 Railway

1. 在 Railway 中创建新项目
2. 连接此目录 `web/turn-server`
3. Railway 会自动检测 Dockerfile 并部署

## 默认凭证

- 用户名: `voiceuser`
- 密码: `voicepass2024`

## 部署后更新前端

在 `index.html` 和 `public.html` 中替换 TURN 配置：

```javascript
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // 你的 TURN 服务器
        { 
            urls: 'turn:你的-turn-server.railway.app:3478', 
            username: 'voiceuser', 
            credential: 'voicepass2024' 
        }
    ],
    iceTransportPolicy: 'all'
};
```

## 本地测试

```bash
docker build -t coturn-server .
docker run -p 3478:3478 -p 3479:3479 coturn-server
```

## 端口说明

- 3478: TURN TCP/UDP (主要)
- 3479: TURN over TLS
- 49160-49200: 中继端口范围
