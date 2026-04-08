package com.example.voicecall

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.voicecall.databinding.ActivityMainBinding
import com.google.gson.Gson
import kotlinx.coroutines.*
import okhttp3.*
import okio.ByteString
import java.util.*
import kotlin.collections.HashMap

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val TAG = "VoiceCall"

    // 状态
    private var isInRoom = false
    private var isMuted = false
    private var isSpeakerOn = true
    private var currentRoomId = ""
    private var currentUserId = ""

    // WebSocket
    private var webSocket: WebSocket? = null
    private val httpClient = OkHttpClient()
    private val gson = Gson()

    // Peer 连接
    private val peerConnections = HashMap<String, Any>()

    // 协程
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    // 权限
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.entries.all { it.value }
        if (!allGranted) {
            Toast.makeText(this, "需要麦克风权限", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        checkPermissions()
    }

    private fun setupUI() {
        // 默认值
        currentUserId = "android_${UUID.randomUUID().toString().take(8)}"
        binding.etUserId.setText(currentUserId)

        // 加入房间
        binding.btnJoinRoom.setOnClickListener {
            val roomId = binding.etRoomId.text.toString().trim()
            val userId = binding.etUserId.text.toString().trim()
            val serverUrl = binding.etServerUrl.text.toString().trim()

            if (serverUrl.isEmpty()) {
                binding.etServerUrl.error = "请输入服务器地址"
                return@setOnClickListener
            }
            if (roomId.isEmpty()) {
                binding.etRoomId.error = "请输入房间号"
                return@setOnClickListener
            }
            if (userId.isEmpty()) {
                binding.etUserId.error = "请输入用户名"
                return@setOnClickListener
            }

            currentRoomId = roomId
            currentUserId = userId
            Constants.SIGNALING_SERVER // 保存服务器地址
            connectToSignalingServer(serverUrl)
        }

        // 离开房间
        binding.btnLeaveRoom.setOnClickListener {
            leaveRoom()
        }

        // 静音
        binding.btnMute.setOnClickListener {
            toggleMute()
        }

        // 扬声器
        binding.btnSpeaker.setOnClickListener {
            toggleSpeaker()
        }
    }

    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS
        )

        val notGranted = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (notGranted.isNotEmpty()) {
            permissionLauncher.launch(notGranted.toTypedArray())
        }
    }

    private fun connectToSignalingServer(serverUrl: String) {
        updateStatus("正在连接服务器...")

        val wsUrl = serverUrl
            .replace("http://", "ws://")
            .replace("https://", "wss://")
            .trimEnd('/')

        val request = Request.Builder()
            .url(wsUrl)
            .build()

        webSocket = httpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket 连接成功")
                runOnUiThread {
                    updateStatus("已连接服务器")
                    joinRoom()
                }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "收到消息: $text")
                handleMessage(text)
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                Log.d(TAG, "收到二进制消息")
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "连接关闭中: $reason")
                webSocket.close(1000, null)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "连接已关闭: $reason")
                runOnUiThread {
                    updateStatus("连接已断开")
                    showCallUI(false)
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "连接失败", t)
                runOnUiThread {
                    updateStatus("连接失败: ${t.message}")
                    Toast.makeText(this@MainActivity, "无法连接到服务器", Toast.LENGTH_LONG).show()
                }
            }
        })
    }

    private fun joinRoom() {
        updateStatus("正在加入房间 $currentRoomId...")

        val message = mapOf(
            "type" to "join",
            "roomId" to currentRoomId,
            "userId" to currentUserId
        )

        sendMessage(message)
    }

    private fun leaveRoom() {
        if (!isInRoom) return

        val message = mapOf("type" to "leave")
        sendMessage(message)

        isInRoom = false
        updateStatus("已离开房间")
        showCallUI(false)
        webSocket?.close(1000, "用户离开")
    }

    private fun handleMessage(text: String) {
        try {
            val data = gson.fromJson(text, Map::class.java)
            val type = data["type"] as? String ?: return

            runOnUiThread {
                when (type) {
                    "room-users" -> {
                        val users = data["users"] as? List<*>
                        updateUsersList(users ?: emptyList<String>())
                    }
                    "user-joined" -> {
                        val userId = data["userId"] as? String
                        Log.d(TAG, "$userId 加入了房间")
                        addUserToList(userId ?: "")
                    }
                    "user-left" -> {
                        val userId = data["userId"] as? String
                        Log.d(TAG, "$userId 离开了房间")
                        removeUserFromList(userId ?: "")
                    }
                    "offer" -> {
                        val from = data["from"] as? String
                        @Suppress("UNCHECKED_CAST")
                        val payload = data["payload"] as? Map<String, Any>
                        Log.d(TAG, "收到来自 $from 的通话请求")
                    }
                    "answer" -> {
                        val from = data["from"] as? String
                        Log.d(TAG, "收到来自 $from 的应答")
                    }
                    "ice-candidate" -> {
                        val from = data["from"] as? String
                        Log.d(TAG, "收到来自 $from 的 ICE 候选")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "消息解析错误", e)
        }
    }

    private fun sendMessage(message: Map<String, Any>) {
        val json = gson.toJson(message)
        webSocket?.send(json)
        Log.d(TAG, "发送消息: $json")
    }

    private fun toggleMute() {
        isMuted = !isMuted
        if (isMuted) {
            binding.btnMute.text = "取消静音"
            updateStatus("已静音")
        } else {
            binding.btnMute.text = "静音"
            updateStatus("已取消静音")
        }
    }

    private fun toggleSpeaker() {
        isSpeakerOn = !isSpeakerOn
        binding.btnSpeaker.text = if (isSpeakerOn) "扬声器" else "听筒"
        updateStatus(if (isSpeakerOn) "已切换到扬声器" else "已切换到听筒")
    }

    private fun updateStatus(status: String) {
        binding.tvStatus.text = status
        Log.d(TAG, "状态: $status")
    }

    private fun showCallUI(inCall: Boolean) {
        if (inCall) {
            binding.layoutJoin.visibility = View.GONE
            binding.layoutCall.visibility = View.VISIBLE
            binding.tvCurrentRoomId.text = currentRoomId
            binding.tvCurrentUserId.text = currentUserId
            isInRoom = true
            updateStatus("已加入房间 $currentRoomId")
        } else {
            binding.layoutJoin.visibility = View.VISIBLE
            binding.layoutCall.visibility = View.GONE
        }
    }

    private fun updateUsersList(users: List<String>) {
        // 简化实现，实际应更新 UI
        Log.d(TAG, "在线用户: $users")
    }

    private fun addUserToList(userId: String) {
        // 简化实现
    }

    private fun removeUserFromList(userId: String) {
        // 简化实现
    }

    override fun onDestroy() {
        super.onDestroy()
        if (isInRoom) {
            leaveRoom()
        }
        scope.cancel()
        webSocket?.close(1000, "应用关闭")
    }
}
