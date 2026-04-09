/**
 * 🖱️ 远程控制服务端
 * 
 * 使用说明：
 * 1. 安装依赖: npm install robotjs ws
 * 2. 运行: node control-server.js
 * 3. 在PC端浏览器打开 public.html，点击"共享屏幕"后点击"允许远程控制"
 * 4. 在手机端打开 index.html，进入同一房间，点击"全屏"按钮即可远程控制PC
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// 尝试加载robotjs（跨平台鼠标键盘控制库）
let robot = null;
try {
    robot = require('robotjs');
    console.log('✅ robotjs 已加载');
} catch (e) {
    console.log('⚠️  robotjs 未安装，将使用模拟模式');
    console.log('   安装命令: npm install robotjs');
}

// 尝试加载pyautogui（Python自动化工具的Node移植）
let pyautogui = null;
try {
    pyautogui = require('pyautogui');
    console.log('✅ pyautogui 已加载');
} catch (e) {
    // pyautogui需要Python，忽略
}

// WebSocket服务器端口
const CONTROL_PORT = 9222;

// HTTP服务器 - 接收来自网页的控制请求
const server = http.createServer((req, res) => {
    // CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/control') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                executeControl(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// WebSocket服务器 - 实时接收控制命令
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
    console.log('[控制] 新连接');
    clients.add(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('[控制] 收到消息:', data.type);
            
            if (data.type === 'register') {
                ws.userId = data.userId;
                console.log(`[控制] 用户注册: ${data.userId}`);
                ws.send(JSON.stringify({ type: 'registered', userId: data.userId }));
            } else if (data.type === 'control') {
                executeControl(data);
                // 广播给所有连接的客户端（用于调试显示）
                broadcastControl(data);
            }
        } catch (e) {
            console.error('[控制] 消息解析错误:', e);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('[控制] 连接关闭');
    });
});

// 执行控制命令
function executeControl(data) {
    const { action, x, y, pixelX, pixelY, button, key } = data;
    
    if (robot) {
        switch (action) {
            case 'mousemove':
                // 获取当前鼠标位置并移动
                const current = robot.getMousePos();
                robot.moveMouse(current.x + x, current.y + y);
                console.log(`[控制] 鼠标移动: ${x}, ${y}`);
                break;
                
            case 'mousemoveabs':
                // 优先使用像素坐标，否则使用原始坐标
                if (typeof pixelX === 'number' && typeof pixelY === 'number') {
                    robot.moveMouse(pixelX, pixelY);
                    console.log(`[控制] 鼠标移动到像素坐标: ${pixelX}, ${pixelY}`);
                } else if (typeof x === 'number' && typeof y === 'number') {
                    robot.moveMouse(x, y);
                    console.log(`[控制] 鼠标移动到: ${x}, ${y}`);
                }
                break;
                
            case 'click':
                if (button === 0) {
                    robot.mouseClick();
                } else if (button === 2) {
                    robot.mouseClick('right');
                }
                console.log(`[控制] 鼠标点击: ${button === 0 ? '左键' : '右键'}`);
                break;
                
            case 'mousedown':
                if (button === 0) {
                    robot.mouseToggle('down');
                } else if (button === 2) {
                    robot.mouseToggle('down', 'right');
                }
                console.log(`[控制] 鼠标按下: ${button}`);
                break;
                
            case 'mouseup':
                if (button === 0) {
                    robot.mouseToggle('up');
                } else if (button === 2) {
                    robot.mouseToggle('up', 'right');
                }
                console.log(`[控制] 鼠标释放: ${button}`);
                break;
                
            case 'keypress':
                robot.keyTap(key);
                console.log(`[控制] 按键: ${key}`);
                break;
                
            case 'type':
                robot.typeString(key);
                console.log(`[控制] 输入文本: ${key}`);
                break;
                
            case 'scroll':
                robot.scrollMouse(x, y);
                console.log(`[控制] 滚动: ${x}, ${y}`);
                break;
        }
    } else {
        // 模拟模式 - 只打印
        console.log(`[控制-模拟] 操作: ${action}`, data);
    }
}

// 广播控制事件给所有客户端
function broadcastControl(data) {
    const msg = JSON.stringify(data);
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    }
}

// 启动服务器
server.listen(CONTROL_PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🖱️ 远程控制服务已启动');
    console.log('');
    console.log(`📡 HTTP控制端点: http://localhost:${CONTROL_PORT}/control`);
    console.log(`📡 WebSocket端点: ws://localhost:${CONTROL_PORT}`);
    console.log('');
    if (robot) {
        console.log('✅ 机器人控制已就绪');
    } else {
        console.log('⚠️  机器人控制未就绪 (robotjs未安装)');
        console.log('   将在模拟模式下运行');
    }
    console.log('');
});

// 处理进程退出
process.on('SIGINT', () => {
    console.log('\n[控制] 正在关闭...');
    wss.close();
    server.close();
    process.exit(0);
});
