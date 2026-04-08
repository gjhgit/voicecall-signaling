package com.example.voicecall

/**
 * 应用配置
 * 
 * 信令服务器地址 - 局域网内运行信令服务器的电脑IP
 * 例如: http://192.168.1.100:3000
 */
object Constants {
    // 信令服务器地址（运行 server.js 的电脑的 IP）
    // 启动服务器后自动获取
    const val SIGNALING_SERVER = "http://192.168.1.100:3000"
}
