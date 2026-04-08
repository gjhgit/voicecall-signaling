@echo off
REM ============================================
REM VoiceCall 一键部署脚本 (Windows PowerShell)
REM ============================================

echo ========================================
echo 🎙️  VoiceCall 部署脚本
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js 未安装
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 Git
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Git 未安装
    echo 请先安装 Git: https://git-scm.com/
    pause
    exit /b 1
)

echo ✅ 依赖检查完成
echo.

REM 获取配置
set /p TRTC_APP_ID="请输入 TRTC AppID: "
set /p TRTC_SECRET_KEY="请输入 TRTC SecretKey: "

if "%TRTC_APP_ID%"=="" (
    echo ❌ AppID 不能为空
    exit /b 1
)

if "%TRTC_SECRET_KEY%"=="" (
    echo ❌ SecretKey 不能为空
    exit /b 1
)

echo.
echo ========================================
echo 🚀 开始部署
echo ========================================
echo.

REM 初始化 Git
echo 📁 初始化 Git 仓库...
git init
git add .
git commit -m "Initial commit: VoiceCall 语音通话应用"
echo ✅ Git 仓库初始化完成
echo.

REM 创建 GitHub 仓库
echo 🌐 创建 GitHub 仓库...
set /p REPO_NAME="请输入仓库名称 (默认: voice-call): "
if "%REPO_NAME%"=="" set REPO_NAME=voice-call

REM 检查 GitHub CLI
where gh >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo ✅ GitHub CLI 已安装
    gh repo create %REPO_NAME% --public --source=. --push
    gh secret set TRTC_APP_ID --body "%TRTC_APP_ID%"
    gh secret set TRTC_SECRET_KEY --body "%TRTC_SECRET_KEY%"
    echo ✅ GitHub Secrets 配置完成
) else (
    echo ⚠️  GitHub CLI 未安装
    echo 请手动创建 GitHub 仓库并执行:
    echo   git remote add origin https://github.com/YOUR_USERNAME/%REPO_NAME%.git
    echo   git push -u origin main
)

echo.

REM 完成
echo ========================================
echo ✅ 部署准备完成！
echo ========================================
echo.
echo 📋 下一步:
echo.
echo 1. 📱 Android 应用:
echo    - 编辑 android\app\...\Constants.kt
echo    - 替换 TRTC_APP_ID 和 SECRET_KEY
echo    - 使用 Android Studio 编译 APK
echo.
echo 2. 🌐 Web 应用:
echo    - 编辑 web\frontend\index.html
echo    - 替换 CONFIG 中的配置
echo.
echo 3. 🚂 Railway 部署:
echo    - 访问 https://railway.app
echo    - Deploy from GitHub
echo    - 添加环境变量
echo.
echo 📖 详细说明请查看 DEPLOY.md
echo.

pause
