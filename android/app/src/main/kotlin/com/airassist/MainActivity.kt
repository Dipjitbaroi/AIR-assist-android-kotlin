package com.airassist

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.concurrentReactEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle

/**
 * Main Activity for the AIR-assist application.
 * 
 * This activity serves as the entry point for the React Native application.
 * It extends ReactActivity to provide the necessary React Native integration.
 */
class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String = "AIRAssist"

    /**
     * Called when the activity is first created.
     * We override this method to set up any native Android functionality.
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Any additional setup can be done here
    }

    /**
     * Returns the instance of the ReactActivityDelegate.
     * This allows you to customize the React Native setup.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            this,
            mainComponentName,
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            fabricEnabled,
            // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
            concurrentReactEnabled
        )
    }
}
