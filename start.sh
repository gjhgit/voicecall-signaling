#!/bin/bash

echo "=========================================="
echo "  🎙️ 局域网语音通话 - 快速启动"
echo "=========================================="
echo ""

cd "$(dirname "$0")/web/signaling"

echo "📦 正在安装依赖..."
npm install

echo ""
echo "🚀 正在启动服务器..."
echo ""
echo "📡 服务器启动后，请访问:"
echo "   本机: http://localhost:3000"
echo "   局域网: http://[你的IP]:3000"
echo ""
echo "💡 在浏览器中打开上述地址即可使用"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm start
