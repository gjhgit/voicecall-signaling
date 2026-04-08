#!/bin/bash

# ============================================
# VoiceCall 一键部署脚本
# ============================================

set -e

echo "========================================"
echo "🎙️  VoiceCall 部署脚本"
echo "========================================"
echo ""

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 未安装${NC}"
        echo "请先安装 $1"
        exit 1
    fi
}

# 打印步骤
print_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 检查依赖
echo "📦 检查依赖..."
check_command node
check_command npm
check_command git
print_step "依赖检查完成"
echo ""

# 获取配置
read -p "请输入 TRTC AppID: " TRTC_APP_ID
read -p "请输入 TRTC SecretKey: " TRTC_SECRET_KEY

if [ -z "$TRTC_APP_ID" ] || [ -z "$TRTC_SECRET_KEY" ]; then
    echo -e "${RED}❌ AppID 或 SecretKey 不能为空${NC}"
    exit 1
fi

echo ""

# 检查 GitHub CLI
if command -v gh &> /dev/null; then
    GITHUB_CLI=true
    echo "✅ GitHub CLI 已安装"
else
    GITHUB_CLI=false
    echo -e "${YELLOW}⚠️  GitHub CLI 未安装，将使用 HTTPS 方式${NC}"
fi

echo ""
echo "========================================"
echo "🚀 开始部署"
echo "========================================"
echo ""

# Step 1: 初始化 Git
echo "📁 初始化 Git 仓库..."
git init
git add .
git commit -m "Initial commit: VoiceCall 语音通话应用"
print_step "Git 仓库初始化完成"
echo ""

# Step 2: 创建 GitHub 仓库
echo "🌐 创建 GitHub 仓库..."
REPO_NAME="voice-call"

if [ "$GITHUB_CLI" = true ]; then
    gh repo create $REPO_NAME --public --source=. --push
else
    echo "请手动创建 GitHub 仓库，然后将远程地址添加到本地："
    echo "  git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    echo "  git push -u origin main"
fi

print_step "GitHub 仓库创建完成"
echo ""

# Step 3: 配置环境变量
echo "🔐 配置 GitHub Secrets..."
if [ "$GITHUB_CLI" = true ]; then
    gh secret set TRTC_APP_ID --body "$TRTC_APP_ID"
    gh secret set TRTC_SECRET_KEY --body "$TRTC_SECRET_KEY"
    print_step "GitHub Secrets 配置完成"
fi
echo ""

# Step 4: Railway 部署
echo "🚂 准备 Railway 部署..."
echo ""
echo "请按以下步骤操作："
echo "1. 访问 https://railway.app"
echo "2. 登录并点击 'New Project'"
echo "3. 选择 'Deploy from GitHub repo'"
echo "4. 选择 '$REPO_NAME' 仓库"
echo "5. 在 Variables 中添加："
echo "   - TRTC_APP_ID = $TRTC_APP_ID"
echo "   - TRTC_SECRET_KEY = $TRTC_SECRET_KEY"
echo ""

# Step 5: 完成
echo ""
echo "========================================"
echo -e "${GREEN}✅ 部署准备完成！${NC}"
echo "========================================"
echo ""
echo "📋 下一步："
echo ""
echo "1. 📱 Android 应用："
echo "   - 编辑 android/app/.../Constants.kt"
echo "   - 替换 TRTC_APP_ID 和 SECRET_KEY"
echo "   - 使用 Android Studio 编译 APK"
echo ""
echo "2. 🌐 Web 应用："
echo "   - 编辑 web/frontend/index.html"
echo "   - 替换 CONFIG 中的 appId 和 serverUrl"
echo ""
echo "3. 🚂 Railway 部署后："
echo "   - 获取 Railway 提供的 URL"
echo "   - 更新前端 serverUrl"
echo "   - 推送到 GitHub"
echo ""
echo "📖 详细说明请查看 DEPLOY.md"
echo ""
