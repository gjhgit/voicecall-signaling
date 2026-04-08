# 🎙️ VoiceCall - 局域网语音通话

基于 **WebRTC** 的 P2P 语音通话应用，**无需任何外部账号**，完全免费！

## ✨ 特点

- ✅ **纯 WebRTC** - 无需腾讯云、无需注册
- ✅ **局域网直连** - 同一 WiFi 下直接通话
- ✅ **Web + Android** - 浏览器和手机互通
- ✅ **一键启动** - 信令服务器一键运行

## 🚀 快速开始

### 1. 启动信令服务器

**Windows:**
```batch
双击运行 start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

服务器会显示局域网 IP，例如 `http://192.168.1.100:3000`

### 2. Web 端使用

在浏览器打开服务器地址，输入房间号和昵称即可。

### 3. Android 端使用

1. 安装 APK
2. 输入服务器地址
3. 输入相同的房间号
4. 加入通话

## 📁 项目结构

```
voice-call/
├── web/
│   ├── frontend/           # Web 前端
│   └── signaling/         # 信令服务器
├── android/               # Android 应用
├── start.bat             # Windows 启动脚本
└── start.sh              # Mac/Linux 启动脚本
```

## 🔧 技术栈

- **信令服务器**: Node.js + WebSocket
- **Web 前端**: HTML5 + WebRTC
- **Android**: Kotlin + WebRTC

## ⚠️ 注意事项

1. 手机和电脑必须在同一个 WiFi 网络
2. 确保电脑防火墙允许 3000 端口

## 📖 详细文档

请查看 [DEPLOY.md](DEPLOY.md)
