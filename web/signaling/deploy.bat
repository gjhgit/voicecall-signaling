@echo off
chcp 65001 >nul
echo ================================================
echo   GitHub + Railway 自动化部署脚本
echo ================================================
echo.

cd /d "%~dp0"

echo [1/5] 检查Git状态...
git status >nul 2>&1
if errorlevel 1 (
    echo 错误: 请在git仓库中运行此脚本
    pause
    exit /b 1
)

echo [2/5] 创建GitHub仓库...
gh repo create voicecall-signaling --public --source=. --remote=origin --push 2>nul
if errorlevel 1 (
    echo 仓库可能已存在，跳过创建步骤...
)

echo [3/5] 推送代码到GitHub...
git push -u origin master
if errorlevel 1 (
    echo 错误: 推送失败！
    pause
    exit /b 1
)

echo [4/5] 打开Railway进行部署...
echo.
echo ================================================
echo   请在 Railway 中完成以下操作:
echo ================================================
echo   1. 访问: https://railway.app
echo   2. 登录并点击 "New Project"
echo   3. 选择 "Deploy from GitHub repo"
echo   4. 选择 "voicecall-signaling" 仓库
echo   5. Railway会自动检测Node.js并部署
echo.
echo   部署完成后，访问:
echo   https://voicecall-signaling.up.railway.app
echo ================================================
echo.

start https://railway.app

echo [5/5] 完成!
pause
