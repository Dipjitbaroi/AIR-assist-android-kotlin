package com.airassist.modules

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import java.util.*

/**
 * Native Permissions Module for React Native
 *
 * Handles permission requests and checks for the application.
 */
class PermissionsModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext),
    PermissionListener {

    companion object {
        private const val TAG = "PermissionsModule"
        private const val MODULE_NAME = "PermissionsModule"
        
        // Request codes
        private const val REQUEST_BLUETOOTH_PERMISSIONS = 1
        private const val REQUEST_MICROPHONE_PERMISSIONS = 2
        private const val REQUEST_STORAGE_PERMISSIONS = 3
        
        // Permissions
        private val BLUETOOTH_PERMISSIONS = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        } else {
            arrayOf(
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        }
        
        private val MICROPHONE_PERMISSIONS = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS
        )
        
        private val STORAGE_PERMISSIONS = arrayOf(
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        )
    }

    // Promise for current permission request
    private var permissionPromise: Promise? = null
    private var currentRequestCode: Int = 0

    /**
     * Get the name of this module for React Native
     */
    override fun getName(): String = MODULE_NAME

    /**
     * Check if a permission is granted
     */
    @ReactMethod
    fun checkPermission(permission: String, promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            val result = ContextCompat.checkSelfPermission(activity, permission)
            promise.resolve(result == PackageManager.PERMISSION_GRANTED)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking permission", e)
            promise.reject("PERMISSION_ERROR", "Failed to check permission", e)
        }
    }

    /**
     * Request a permission
     */
    @ReactMethod
    fun requestPermission(permission: String, promise: Promise) {
        try {
            val activity = currentActivity as? PermissionAwareActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            // Check if permission is already granted
            if (ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED) {
                promise.resolve(true)
                return
            }
            
            // Store promise for later resolution
            permissionPromise = promise
            currentRequestCode = UUID.randomUUID().hashCode() and 0xFFFF
            
            // Request permission
            activity.requestPermissions(arrayOf(permission), currentRequestCode, this)
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting permission", e)
            promise.reject("PERMISSION_ERROR", "Failed to request permission", e)
        }
    }

    /**
     * Request Bluetooth permissions
     */
    @ReactMethod
    fun requestBluetoothPermissions(promise: Promise) {
        try {
            val activity = currentActivity as? PermissionAwareActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            // Check if all permissions are already granted
            val allGranted = BLUETOOTH_PERMISSIONS.all { permission ->
                ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
            }
            
            if (allGranted) {
                promise.resolve(true)
                return
            }
            
            // Store promise for later resolution
            permissionPromise = promise
            currentRequestCode = REQUEST_BLUETOOTH_PERMISSIONS
            
            // Request permissions
            activity.requestPermissions(BLUETOOTH_PERMISSIONS, REQUEST_BLUETOOTH_PERMISSIONS, this)
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting Bluetooth permissions", e)
            promise.reject("PERMISSION_ERROR", "Failed to request Bluetooth permissions", e)
        }
    }

    /**
     * Request microphone permissions
     */
    @ReactMethod
    fun requestMicrophonePermissions(promise: Promise) {
        try {
            val activity = currentActivity as? PermissionAwareActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            // Check if all permissions are already granted
            val allGranted = MICROPHONE_PERMISSIONS.all { permission ->
                ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
            }
            
            if (allGranted) {
                promise.resolve(true)
                return
            }
            
            // Store promise for later resolution
            permissionPromise = promise
            currentRequestCode = REQUEST_MICROPHONE_PERMISSIONS
            
            // Request permissions
            activity.requestPermissions(MICROPHONE_PERMISSIONS, REQUEST_MICROPHONE_PERMISSIONS, this)
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting microphone permissions", e)
            promise.reject("PERMISSION_ERROR", "Failed to request microphone permissions", e)
        }
    }

    /**
     * Request storage permissions
     */
    @ReactMethod
    fun requestStoragePermissions(promise: Promise) {
        try {
            val activity = currentActivity as? PermissionAwareActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            // Check if all permissions are already granted
            val allGranted = STORAGE_PERMISSIONS.all { permission ->
                ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
            }
            
            if (allGranted) {
                promise.resolve(true)
                return
            }
            
            // Store promise for later resolution
            permissionPromise = promise
            currentRequestCode = REQUEST_STORAGE_PERMISSIONS
            
            // Request permissions
            activity.requestPermissions(STORAGE_PERMISSIONS, REQUEST_STORAGE_PERMISSIONS, this)
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting storage permissions", e)
            promise.reject("PERMISSION_ERROR", "Failed to request storage permissions", e)
        }
    }

    /**
     * Check if Bluetooth permissions are granted
     */
    @ReactMethod
    fun hasBluetoothPermissions(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            // Check if all permissions are granted
            val allGranted = BLUETOOTH_PERMISSIONS.all { permission ->
                ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
            }
            
            promise.resolve(allGranted)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking Bluetooth permissions", e)
            promise.reject("PERMISSION_ERROR", "Failed to check Bluetooth permissions", e)
        }
    }

    /**
     * Check if microphone permission is granted
     */
    @ReactMethod
    fun hasMicrophonePermission(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            // Check if all permissions are granted
            val allGranted = MICROPHONE_PERMISSIONS.all { permission ->
                ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
            }
            
            promise.resolve(allGranted)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking microphone permission", e)
            promise.reject("PERMISSION_ERROR", "Failed to check microphone permission", e)
        }
    }

    /**
     * Check if storage permissions are granted
     */
    @ReactMethod
    fun hasStoragePermissions(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            // Check if all permissions are granted
            val allGranted = STORAGE_PERMISSIONS.all { permission ->
                ContextCompat.checkSelfPermission(activity, permission) == PackageManager.PERMISSION_GRANTED
            }
            
            promise.resolve(allGranted)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking storage permissions", e)
            promise.reject("PERMISSION_ERROR", "Failed to check storage permissions", e)
        }
    }

    /**
     * Handle permission result
     */
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray): Boolean {
        if (requestCode == currentRequestCode) {
            // Check if all permissions were granted
            val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            
            // Resolve promise
            permissionPromise?.resolve(allGranted)
            permissionPromise = null
            
            return true
        }
        return false
    }
}
