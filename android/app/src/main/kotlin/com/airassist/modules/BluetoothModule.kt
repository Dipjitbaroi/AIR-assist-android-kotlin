package com.airassist.modules

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.ParcelUuid
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import java.util.*
import java.util.concurrent.ConcurrentHashMap

/**
 * Native Bluetooth Module for React Native
 *
 * Provides Bluetooth Low Energy (BLE) functionality for the application.
 */
class BluetoothModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), 
    PermissionListener {

    companion object {
        private const val TAG = "BluetoothModule"
        private const val MODULE_NAME = "BluetoothModule"
        
        // Request codes
        private const val REQUEST_ENABLE_BT = 1
        private const val REQUEST_PERMISSIONS = 2
        
        // Scan timeout (milliseconds)
        private const val SCAN_TIMEOUT = 10000L
    }

    // Bluetooth state
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var isScanning = false
    private val discoveredDevices = ConcurrentHashMap<String, BluetoothDevice>()
    private val connectedDevices = ConcurrentHashMap<String, BluetoothDevice>()
    private val mainHandler = Handler(Looper.getMainLooper())
    
    // Scan callback
    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val device = result.device
            if (device.name != null) {
                discoveredDevices[device.address] = device
                sendDeviceEvent(device, result.rssi)
            }
        }

        override fun onBatchScanResults(results: List<ScanResult>) {
            for (result in results) {
                val device = result.device
                if (device.name != null) {
                    discoveredDevices[device.address] = device
                    sendDeviceEvent(device, result.rssi)
                }
            }
        }

        override fun onScanFailed(errorCode: Int) {
            Log.e(TAG, "Scan failed with error code: $errorCode")
            stopScan()
            sendEvent("onScanFailed", Arguments.createMap().apply {
                putInt("errorCode", errorCode)
            })
        }
    }

    /**
     * Initialize the module
     */
    init {
        // Get Bluetooth adapter
        val bluetoothManager = reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothAdapter = bluetoothManager.adapter
    }

    /**
     * Get the name of this module for React Native
     */
    override fun getName(): String = MODULE_NAME

    /**
     * Initialize the Bluetooth module
     */
    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            // Check if device supports Bluetooth
            if (bluetoothAdapter == null) {
                promise.reject("BT_UNSUPPORTED", "Bluetooth is not supported on this device")
                return
            }
            
            // Check if Bluetooth is enabled
            val isEnabled = bluetoothAdapter?.isEnabled ?: false
            
            val result = Arguments.createMap()
            result.putBoolean("isEnabled", isEnabled)
            
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing Bluetooth module", e)
            promise.reject("INIT_ERROR", "Failed to initialize Bluetooth module", e)
        }
    }

    /**
     * Check if Bluetooth is enabled
     */
    @ReactMethod
    fun isEnabled(promise: Promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BT_UNSUPPORTED", "Bluetooth is not supported on this device")
                return
            }
            
            promise.resolve(bluetoothAdapter?.isEnabled ?: false)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking Bluetooth state", e)
            promise.reject("BT_ERROR", "Failed to check Bluetooth state", e)
        }
    }

    /**
     * Request to enable Bluetooth
     */
    @ReactMethod
    fun requestEnable(promise: Promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BT_UNSUPPORTED", "Bluetooth is not supported on this device")
                return
            }
            
            if (bluetoothAdapter?.isEnabled == true) {
                promise.resolve(true)
                return
            }
            
            // Request to enable Bluetooth
            val activity = currentActivity as? PermissionAwareActivity
            if (activity == null) {
                promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available")
                return
            }
            
            val intent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
            activity.startActivityForResult(intent, REQUEST_ENABLE_BT, null)
            
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting Bluetooth enable", e)
            promise.reject("BT_ERROR", "Failed to request Bluetooth enable", e)
        }
    }

    /**
     * Start scanning for Bluetooth devices
     */
    @ReactMethod
    fun startScan(options: ReadableMap, promise: Promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BT_UNSUPPORTED", "Bluetooth is not supported on this device")
                return
            }
            
            if (bluetoothAdapter?.isEnabled != true) {
                promise.reject("BT_DISABLED", "Bluetooth is not enabled")
                return
            }
            
            if (isScanning) {
                promise.reject("ALREADY_SCANNING", "Already scanning for devices")
                return
            }
            
            // Clear discovered devices
            discoveredDevices.clear()
            
            // Configure scan settings
            val scanSettings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .build()
            
            // Start scanning
            bluetoothAdapter?.bluetoothLeScanner?.startScan(null, scanSettings, scanCallback)
            isScanning = true
            
            // Send event to JavaScript
            sendEvent("onScanStarted", Arguments.createMap())
            
            // Set timeout to stop scanning
            mainHandler.postDelayed({
                if (isScanning) {
                    stopScan()
                }
            }, SCAN_TIMEOUT)
            
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting scan", e)
            promise.reject("SCAN_ERROR", "Failed to start scanning", e)
        }
    }

    /**
     * Stop scanning for Bluetooth devices
     */
    @ReactMethod
    fun stopScan(promise: Promise) {
        try {
            if (!isScanning) {
                promise.resolve(false)
                return
            }
            
            stopScan()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping scan", e)
            promise.reject("SCAN_ERROR", "Failed to stop scanning", e)
        }
    }

    /**
     * Connect to a Bluetooth device
     */
    @ReactMethod
    fun connectToDevice(deviceId: String, promise: Promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BT_UNSUPPORTED", "Bluetooth is not supported on this device")
                return
            }
            
            if (bluetoothAdapter?.isEnabled != true) {
                promise.reject("BT_DISABLED", "Bluetooth is not enabled")
                return
            }
            
            // Get device from discovered devices or by address
            val device = discoveredDevices[deviceId] ?: bluetoothAdapter?.getRemoteDevice(deviceId)
            
            if (device == null) {
                promise.reject("DEVICE_NOT_FOUND", "Device not found")
                return
            }
            
            // In a real implementation, we would establish a GATT connection here
            // For this example, we'll simulate a successful connection
            
            // Add to connected devices
            connectedDevices[deviceId] = device
            
            // Create device info
            val deviceInfo = Arguments.createMap()
            deviceInfo.putString("id", device.address)
            deviceInfo.putString("name", device.name ?: "Unknown Device")
            
            // Send event to JavaScript
            sendEvent("onDeviceConnected", deviceInfo)
            
            promise.resolve(deviceInfo)
        } catch (e: Exception) {
            Log.e(TAG, "Error connecting to device", e)
            promise.reject("CONNECTION_ERROR", "Failed to connect to device", e)
        }
    }

    /**
     * Disconnect from a Bluetooth device
     */
    @ReactMethod
    fun disconnectFromDevice(deviceId: String, promise: Promise) {
        try {
            if (bluetoothAdapter == null) {
                promise.reject("BT_UNSUPPORTED", "Bluetooth is not supported on this device")
                return
            }
            
            // Check if device is connected
            if (!connectedDevices.containsKey(deviceId)) {
                promise.reject("DEVICE_NOT_CONNECTED", "Device is not connected")
                return
            }
            
            // In a real implementation, we would close the GATT connection here
            // For this example, we'll simulate a successful disconnection
            
            // Remove from connected devices
            connectedDevices.remove(deviceId)
            
            // Send event to JavaScript
            sendEvent("onDeviceDisconnected", Arguments.createMap().apply {
                putString("id", deviceId)
            })
            
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error disconnecting from device", e)
            promise.reject("DISCONNECTION_ERROR", "Failed to disconnect from device", e)
        }
    }

    /**
     * Get connected devices
     */
    @ReactMethod
    fun getConnectedDevices(promise: Promise) {
        try {
            val devices = Arguments.createArray()
            
            for (device in connectedDevices.values) {
                val deviceInfo = Arguments.createMap()
                deviceInfo.putString("id", device.address)
                deviceInfo.putString("name", device.name ?: "Unknown Device")
                devices.pushMap(deviceInfo)
            }
            
            promise.resolve(devices)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting connected devices", e)
            promise.reject("BT_ERROR", "Failed to get connected devices", e)
        }
    }

    /**
     * Write data to a connected device
     */
    @ReactMethod
    fun writeToDevice(deviceId: String, serviceUUID: String, characteristicUUID: String, data: String, promise: Promise) {
        try {
            if (!connectedDevices.containsKey(deviceId)) {
                promise.reject("DEVICE_NOT_CONNECTED", "Device is not connected")
                return
            }
            
            // In a real implementation, we would write to the GATT characteristic here
            // For this example, we'll simulate a successful write
            
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error writing to device", e)
            promise.reject("WRITE_ERROR", "Failed to write to device", e)
        }
    }

    /**
     * Read data from a connected device
     */
    @ReactMethod
    fun readFromDevice(deviceId: String, serviceUUID: String, characteristicUUID: String, promise: Promise) {
        try {
            if (!connectedDevices.containsKey(deviceId)) {
                promise.reject("DEVICE_NOT_CONNECTED", "Device is not connected")
                return
            }
            
            // In a real implementation, we would read from the GATT characteristic here
            // For this example, we'll simulate a successful read with dummy data
            
            val result = Arguments.createMap()
            result.putString("value", "dummy-data")
            
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error reading from device", e)
            promise.reject("READ_ERROR", "Failed to read from device", e)
        }
    }

    /**
     * Stop scanning for devices
     */
    private fun stopScan() {
        if (isScanning) {
            bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback)
            isScanning = false
            
            // Send event to JavaScript
            sendEvent("onScanStopped", Arguments.createMap())
        }
    }

    /**
     * Send device event to JavaScript
     */
    private fun sendDeviceEvent(device: BluetoothDevice, rssi: Int) {
        val deviceInfo = Arguments.createMap()
        deviceInfo.putString("id", device.address)
        deviceInfo.putString("name", device.name ?: "Unknown Device")
        deviceInfo.putInt("rssi", rssi)
        
        sendEvent("onDeviceFound", deviceInfo)
    }

    /**
     * Send event to JavaScript
     */
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /**
     * Handle permission result
     */
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray): Boolean {
        if (requestCode == REQUEST_PERMISSIONS) {
            // Check if all permissions were granted
            val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            
            // Send event to JavaScript
            sendEvent("onPermissionResult", Arguments.createMap().apply {
                putBoolean("granted", allGranted)
            })
            
            return true
        }
        return false
    }
}
