package com.example.voicecall

import android.app.Application
import android.util.Log
import com.tencent.trtc.TRTCCloud
import com.tencent.trtc.TRTCCloudListener

class VoiceCallApp : Application() {

    lateinit var trtcCloud: TRTCCloud
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // 初始化 TRTC SDK
        trtcCloud = TRTCCloud.sharedInstance(this)
        Log.d(TAG, "TRTC SDK initialized")
    }

    override fun onTerminate() {
        super.onTerminate()
        trtcCloud.destroy()
        Log.d(TAG, "TRTC SDK destroyed")
    }

    companion object {
        private const val TAG = "VoiceCallApp"

        @Volatile
        private var instance: VoiceCallApp? = null

        fun getInstance(): VoiceCallApp {
            return instance ?: throw IllegalStateException("Application not initialized")
        }
    }
}
