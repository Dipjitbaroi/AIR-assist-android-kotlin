package com.airassist

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.soloader.SoLoader
import com.airassist.modules.AudioModule
import com.airassist.modules.BluetoothModule
import com.airassist.modules.PermissionsModule

/**
 * Main Application class for the AIR-assist application.
 * 
 * This class initializes React Native and provides the necessary configuration.
 * It also registers custom native modules.
 */
class MainApplication : Application(), ReactApplication {

    /**
     * React Native Host configuration
     */
    private val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> {
                // Packages that cannot be autolinked yet can be added manually here
                val packages = PackageList(this).packages.toMutableList()
                
                // Add custom packages here
                packages.add(AudioModule())
                packages.add(BluetoothModule())
                packages.add(PermissionsModule())
                
                return packages
            }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override fun isNewArchEnabled(): Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

            override fun isHermesEnabled(): Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    /**
     * React Host getter for React Native 0.73+
     */
    override fun getReactHost(): ReactHost = getDefaultReactHost(this.applicationContext, reactNativeHost)

    /**
     * React Native Host getter
     */
    override fun getReactNativeHost(): ReactNativeHost = reactNativeHost

    /**
     * Called when the application is starting.
     * Initializes SoLoader and React Native.
     */
    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        
        ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)
    }
}
