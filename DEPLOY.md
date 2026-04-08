<<<<<<< HEAD
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
=======
# 🚀 Railway 部署指南

## 方式一：一键部署（推荐）

### 第一步：推送 GitHub

在命令行执行：

```bash
cd c:\Users\Administrator\WorkBuddy\20260408212331\voice-call\web\signaling

# 添加远程仓库
git remote add origin https://github.com/gjhgit/voicecall-signaling.git

# 推送代码
git push -u origin master
```

> ⚠️ 如果提示仓库不存在，先在 GitHub 网页创建：
> 1. 打开 https://github.com/new
> 2. Repository name: `voicecall-signaling`
> 3. 选择 Public
> 4. 点击 Create repository

---

### 第二步：部署到 Railway

1. 打开 **https://railway.app**
2. 登录 GitHub 账号
3. 点击 **New Project** → **Deploy from GitHub repo**
4. 选择 `voicecall-signaling` 仓库
5. Railway 会自动检测 Node.js 并部署

---

### 第三步：获取公网地址

部署成功后，Railway 会分配一个 URL：
```
https://voicecall-signaling.up.railway.app
```

这就是你的公网信令服务器地址！

---

## 📱 使用公网服务

部署成功后，两台设备都访问：

```
https://voicecall-signaling.up.railway.app
```

**注意**：首次访问 HTTPS 时，可能需要手动信任证书。

---

## 🔧 Railway 免费额度

| 资源 | 免费额度 |
|------|----------|
| 实例 | 500小时/月 |
| 流量 | 100GB/月 |
| 存储 | 1GB |

---

## ⚠️ 常见问题

### 1. GitHub 仓库不存在
先在 GitHub 网页创建仓库，再推送代码。

### 2. Railway 部署失败
检查 `railway.json` 是否正确，以及 `package.json` 的 `start` 脚本。

### 3. WebSocket 连接问题
Railway 默认支持 WebSocket，无需额外配置。

---

## 🔄 更新代码

修改代码后：

```bash
cd c:\Users\Administrator\WorkBuddy\20260408212331\voice-call\web\signaling
git add .
git commit -m "更新内容"
git push
```

Railway 会自动检测 GitHub 更新并重新部署。
>>>>>>> a801239f5254ef141a1a6a22c3df0685c1ec696d
