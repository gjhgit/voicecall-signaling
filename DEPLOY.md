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
