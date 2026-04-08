# 🚀 局域网语音通话 - 部署指南

完全免费，无需任何外部账号！

---

## 📋 快速开始（5分钟）

### 第一步：启动信令服务器

在电脑上运行服务器：

```bash
cd voice-call/web/signaling
npm install
npm start
```

服务器启动后会显示：
```
🎙️ VoiceCall 信令服务器已启动

📡 访问地址:
   本机: http://localhost:3000
   局域网: http://192.168.1.100:3000

📱 在浏览器或手机中打开上述地址即可使用
```

**记住这个 IP 地址**（例如 `192.168.1.100`）

---

### 第二步：Web 端使用

1. 打开浏览器
2. 访问 `http://192.168.1.100:3000`（替换为实际IP）
3. 输入房间号（如 `1234`）
4. 输入昵称
5. 点击「加入房间」

---

### 第三步：Android 端使用

1. 安装 APK
2. 在「信令服务器地址」中输入 `http://192.168.1.100:3000`
3. 输入相同的房间号
4. 输入昵称
5. 点击「加入房间」

---

## 📁 项目结构

```
voice-call/
├── web/
│   ├── frontend/           # Web 前端
│   │   └── index.html
│   └── signaling/         # 信令服务器
│       ├── server.js
│       └── package.json
└── android/               # Android 应用
```

---

## 🔧 构建 Android APK

### 方式一：Android Studio

1. 用 Android Studio 打开 `android/` 目录
2. 等待 Gradle 同步完成
3. **Build** → **Build APK(s)** → **Build APK**
4. APK 在 `app/build/outputs/apk/debug/app-debug.apk`

### 方式二：命令行

```bash
cd android
./gradlew assembleDebug
```

---

## ⚠️ 注意事项

1. **同一网络**: 手机和电脑必须在同一个 WiFi 网络下
2. **防火墙**: 确保电脑防火墙允许 3000 端口
3. **IP 地址**: 使用局域网 IP（如 192.168.x.x），不要用 localhost

---

## 🔧 常见问题

### Q: 手机无法连接服务器？
- 确保手机和电脑在同一 WiFi
- 检查服务器是否正在运行
- 检查 IP 地址是否正确

### Q: 听不到声音？
- 检查麦克风权限
- 检查手机音量
- 尝试切换扬声器/听筒

### Q: Android Studio 编译失败？
- 更新 Android Gradle Plugin
- 确保 JDK 17+
- 同步 Gradle

---

## 📡 工作原理

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Android   │◄──────►│  信令服务器  │◄──────►│     Web     │
│   (WebRTC)  │         │ (WebSocket) │         │   (WebRTC)  │
└─────────────┘         └─────────────┘         └─────────────┘
        │                                              │
        └──────────────── P2P 音频流 ─────────────────┘
```

1. 设备连接信令服务器
2. 交换 SDP（会话描述）和 ICE 候选
3. 建立 P2P 连接
4. 直接传输音频数据
