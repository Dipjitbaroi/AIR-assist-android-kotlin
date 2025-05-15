package com.airassist.modules

import android.content.Context
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.os.Build
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Native Audio Module for React Native
 *
 * Provides native audio recording and playback functionality.
 */
class AudioModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "AudioModule"
        private const val MODULE_NAME = "AudioModule"
        
        // Audio configuration
        private const val SAMPLE_RATE = 44100
        private const val CHANNELS = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val BUFFER_SIZE = AudioRecord.getMinBufferSize(
            SAMPLE_RATE, CHANNELS, AUDIO_FORMAT
        ) * 2
    }

    // Audio recording state
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var recordingThread: ExecutorService? = null
    private var recordingFile: File? = null
    
    // Audio playback state
    private var audioTrack: AudioTrack? = null
    private var isPlaying = false
    private var playbackThread: ExecutorService? = null

    /**
     * Get the name of this module for React Native
     */
    override fun getName(): String = MODULE_NAME

    /**
     * Initialize the module
     */
    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            // Create cache directory if it doesn't exist
            val cacheDir = reactApplicationContext.cacheDir
            if (!cacheDir.exists()) {
                cacheDir.mkdirs()
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing audio module", e)
            promise.reject("INIT_ERROR", "Failed to initialize audio module", e)
        }
    }

    /**
     * Start audio recording
     */
    @ReactMethod
    fun startRecording(options: ReadableMap, promise: Promise) {
        if (isRecording) {
            promise.reject("ALREADY_RECORDING", "Already recording audio")
            return
        }

        try {
            // Create temporary file for recording
            recordingFile = File.createTempFile(
                "recording_", ".pcm", reactApplicationContext.cacheDir
            )

            // Initialize AudioRecord
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNELS,
                AUDIO_FORMAT,
                BUFFER_SIZE
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                promise.reject("RECORDING_ERROR", "Failed to initialize AudioRecord")
                return
            }

            // Start recording
            audioRecord?.startRecording()
            isRecording = true

            // Create recording thread
            recordingThread = Executors.newSingleThreadExecutor()
            recordingThread?.submit {
                writeAudioDataToFile()
            }

            // Send event to JavaScript
            sendEvent("onRecordingStarted", Arguments.createMap())
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting recording", e)
            promise.reject("RECORDING_ERROR", "Failed to start recording", e)
        }
    }

    /**
     * Stop audio recording
     */
    @ReactMethod
    fun stopRecording(promise: Promise) {
        if (!isRecording) {
            promise.reject("NOT_RECORDING", "Not currently recording")
            return
        }

        try {
            // Stop recording
            isRecording = false
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null

            // Shutdown recording thread
            recordingThread?.shutdown()
            recordingThread = null

            // Convert PCM to WAV and get base64
            val base64Audio = convertPcmToWavBase64()

            // Create result
            val result = Arguments.createMap()
            result.putString("audioBase64", base64Audio)
            result.putString("path", recordingFile?.absolutePath)

            // Send event to JavaScript
            sendEvent("onRecordingStopped", result)
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping recording", e)
            promise.reject("RECORDING_ERROR", "Failed to stop recording", e)
        }
    }

    /**
     * Play audio from base64 data
     */
    @ReactMethod
    fun playAudio(base64Audio: String, promise: Promise) {
        if (isPlaying) {
            promise.reject("ALREADY_PLAYING", "Already playing audio")
            return
        }

        try {
            // Decode base64 to bytes
            val audioData = Base64.decode(base64Audio, Base64.DEFAULT)

            // Initialize AudioTrack
            audioTrack = AudioTrack(
                AudioManager.STREAM_MUSIC,
                SAMPLE_RATE,
                AudioFormat.CHANNEL_OUT_MONO,
                AUDIO_FORMAT,
                audioData.size,
                AudioTrack.MODE_STATIC
            )

            if (audioTrack?.state != AudioTrack.STATE_INITIALIZED) {
                promise.reject("PLAYBACK_ERROR", "Failed to initialize AudioTrack")
                return
            }

            // Write audio data to AudioTrack
            audioTrack?.write(audioData, 0, audioData.size)

            // Start playback
            audioTrack?.play()
            isPlaying = true

            // Create playback thread to monitor completion
            playbackThread = Executors.newSingleThreadExecutor()
            playbackThread?.submit {
                monitorPlaybackCompletion()
            }

            // Send event to JavaScript
            sendEvent("onPlaybackStarted", Arguments.createMap())
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error playing audio", e)
            promise.reject("PLAYBACK_ERROR", "Failed to play audio", e)
        }
    }

    /**
     * Stop audio playback
     */
    @ReactMethod
    fun stopPlayback(promise: Promise) {
        if (!isPlaying) {
            promise.reject("NOT_PLAYING", "Not currently playing audio")
            return
        }

        try {
            // Stop playback
            isPlaying = false
            audioTrack?.stop()
            audioTrack?.release()
            audioTrack = null

            // Shutdown playback thread
            playbackThread?.shutdown()
            playbackThread = null

            // Send event to JavaScript
            sendEvent("onPlaybackStopped", Arguments.createMap())
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping playback", e)
            promise.reject("PLAYBACK_ERROR", "Failed to stop playback", e)
        }
    }

    /**
     * Clean up resources
     */
    @ReactMethod
    fun cleanup(promise: Promise) {
        try {
            // Stop recording if active
            if (isRecording) {
                stopRecording(promise)
                return
            }

            // Stop playback if active
            if (isPlaying) {
                stopPlayback(promise)
                return
            }

            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning up", e)
            promise.reject("CLEANUP_ERROR", "Failed to clean up resources", e)
        }
    }

    /**
     * Write audio data to file
     */
    private fun writeAudioDataToFile() {
        val buffer = ByteArray(BUFFER_SIZE)
        val outputStream = FileOutputStream(recordingFile)

        while (isRecording) {
            val read = audioRecord?.read(buffer, 0, BUFFER_SIZE) ?: 0
            if (read > 0) {
                outputStream.write(buffer, 0, read)
                
                // Check for silence
                if (isSilence(buffer, read)) {
                    sendEvent("onSilenceDetected", Arguments.createMap())
                }
            }
        }

        outputStream.close()
    }

    /**
     * Check if audio buffer contains silence
     */
    private fun isSilence(buffer: ByteArray, size: Int): Boolean {
        var sum = 0.0
        
        // Calculate RMS (Root Mean Square)
        for (i in 0 until size step 2) {
            if (i + 1 < size) {
                // Convert two bytes to a short (16-bit sample)
                val sample = (buffer[i + 1].toInt() shl 8) or (buffer[i].toInt() and 0xFF)
                sum += sample * sample
            }
        }
        
        val rms = Math.sqrt(sum / (size / 2))
        
        // Threshold for silence detection
        return rms < 500 // Adjust threshold as needed
    }

    /**
     * Monitor audio playback completion
     */
    private fun monitorPlaybackCompletion() {
        while (isPlaying && audioTrack?.playState == AudioTrack.PLAYSTATE_PLAYING) {
            Thread.sleep(100)
        }
        
        if (isPlaying) {
            isPlaying = false
            audioTrack?.release()
            audioTrack = null
            
            // Send event to JavaScript on main thread
            UiThreadUtil.runOnUiThread {
                sendEvent("onPlaybackComplete", Arguments.createMap())
            }
        }
    }

    /**
     * Convert PCM to WAV and return as base64
     */
    private fun convertPcmToWavBase64(): String {
        val inputStream = FileInputStream(recordingFile)
        val pcmData = inputStream.readBytes()
        inputStream.close()

        // Create WAV header
        val wavStream = ByteArrayOutputStream()
        val totalDataLen = pcmData.size + 36
        val byteRate = SAMPLE_RATE * 2 // 16 bits per sample

        // RIFF header
        wavStream.write("RIFF".toByteArray()) // ChunkID
        wavStream.write(intToByteArray(totalDataLen)) // ChunkSize
        wavStream.write("WAVE".toByteArray()) // Format
        
        // fmt subchunk
        wavStream.write("fmt ".toByteArray()) // Subchunk1ID
        wavStream.write(intToByteArray(16)) // Subchunk1Size (16 for PCM)
        wavStream.write(shortToByteArray(1)) // AudioFormat (1 for PCM)
        wavStream.write(shortToByteArray(1)) // NumChannels (1 for mono)
        wavStream.write(intToByteArray(SAMPLE_RATE)) // SampleRate
        wavStream.write(intToByteArray(byteRate)) // ByteRate
        wavStream.write(shortToByteArray(2)) // BlockAlign (2 for mono 16-bit)
        wavStream.write(shortToByteArray(16)) // BitsPerSample
        
        // data subchunk
        wavStream.write("data".toByteArray()) // Subchunk2ID
        wavStream.write(intToByteArray(pcmData.size)) // Subchunk2Size
        
        // Audio data
        wavStream.write(pcmData)
        
        // Convert to base64
        val wavBytes = wavStream.toByteArray()
        return Base64.encodeToString(wavBytes, Base64.DEFAULT)
    }

    /**
     * Convert int to little-endian byte array
     */
    private fun intToByteArray(value: Int): ByteArray {
        return byteArrayOf(
            value.toByte(),
            (value shr 8).toByte(),
            (value shr 16).toByte(),
            (value shr 24).toByte()
        )
    }

    /**
     * Convert short to little-endian byte array
     */
    private fun shortToByteArray(value: Int): ByteArray {
        return byteArrayOf(
            value.toByte(),
            (value shr 8).toByte()
        )
    }

    /**
     * Send event to JavaScript
     */
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
