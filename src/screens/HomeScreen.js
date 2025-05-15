/**
 * Home Screen
 *
 * Main application screen that provides voice interface, conversation display,
 * and controls for interacting with the AI assistant.
 */

import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Contexts
import { AppContext } from '../context/AppContext';
import { BluetoothContext } from '../context/BluetoothContext';

// Services
import { AudioService } from '../services/AudioService';

// Components
import Conversation from '../components/Conversation';
import StatusPanel from '../components/StatusPanel';
import Header from '../components/Header';

// Styles and utilities
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';

/**
 * Home Screen Component
 *
 * @param {Object} props - Component properties
 * @param {Object} props.navigation - Navigation object
 * @returns {React.ReactElement} Rendered component
 */
const HomeScreen = ({ navigation }) => {
  // App context
  const {
    wsConnected,
    settings,
    messages,
    isProcessingAudio,
    isSpeaking,
    sendAudioToServer,
    clearConversation,
    setIsProcessingAudio,
  } = useContext(AppContext);

  // Bluetooth context
  const {
    isBluetoothEnabled,
    connectedDevice,
    connectionState,
    startScan,
    error: bluetoothError,
  } = useContext(BluetoothContext);

  // Local state
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [showBluetoothDevices, setShowBluetoothDevices] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Refs
  const conversationRef = useRef(null);

  /**
   * Effect to scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (conversationRef.current && messages.length > 0) {
      // Use small timeout to ensure layout is complete
      setTimeout(() => {
        conversationRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  /**
   * Effect to handle auto-listening after AI response
   */
  useEffect(() => {
    if (settings.autoListen && !isProcessingAudio && !isSpeaking && !isRecording && isListening) {
      // Start listening again after a short delay
      const timer = setTimeout(() => {
        handleStartRecording();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isProcessingAudio, isSpeaking, isListening, settings.autoListen]);

  /**
   * Effect to start listening when auto-listen is enabled
   */
  useEffect(() => {
    if (settings.autoListen && !isListening && wsConnected && isBluetoothEnabled && connectedDevice) {
      setIsListening(true);
    }
  }, [wsConnected, isBluetoothEnabled, connectedDevice, settings.autoListen]);

  /**
   * Start recording audio
   */
  const handleStartRecording = async () => {
    try {
      // Don't start if already recording or processing
      if (isRecording || isProcessingAudio || isSpeaking) return;

      setIsRecording(true);
      setTranscription('');

      // Configure recording options
      const options = {
        detectSilence: true,
        silenceThreshold: settings.silenceThreshold,
        useVoiceRecognition: true,
        onSilenceDetected: handleStopRecording,
        speechResultsCallback: (text) => {
          setTranscription(text);
        },
      };

      // Start recording
      await AudioService.startRecording(options);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start recording. Please check your permissions.');
    }
  };

  /**
   * Stop recording and process audio
   */
  const handleStopRecording = async () => {
    try {
      if (!isRecording) return;

      setIsRecording(false);

      // Stop recording and get audio data
      const result = await AudioService.stopRecording();

      if (result && result.audioBase64) {
        // Process audio
        await sendAudioToServer(result.audioBase64, result.transcription || transcription);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsProcessingAudio(false);
    }
  };

  /**
   * Toggle showing Bluetooth devices list
   */
  const toggleBluetoothDevices = () => {
    if (!showBluetoothDevices) {
      startScan().catch(console.error);
    }
    setShowBluetoothDevices(!showBluetoothDevices);
  };

  /**
   * Toggle auto-listening mode
   */
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      if (!isRecording && !isProcessingAudio && !isSpeaking) {
        handleStartRecording();
      }
    }
  };

  /**
   * Prompt user to confirm conversation clearing
   */
  const confirmClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear the conversation history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: clearConversation,
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with title and action buttons */}
      <Header
        title="AIRAssist"
        onSettingsPress={() => navigation.navigate('Settings')}
        connectedDevice={connectedDevice}
        onBluetoothPress={toggleBluetoothDevices}
      />

      {/* Status panel showing connection states */}
      <StatusPanel
        wsConnected={wsConnected}
        bluetoothConnected={!!connectedDevice}
        isListening={isListening}
        bluetoothStatus={connectionState}
        showDevices={showBluetoothDevices}
        onClose={() => setShowBluetoothDevices(false)}
      />

      {/* Main conversation area */}
      <View style={styles.content}>
        <Conversation
          messages={messages}
          onClearConversation={confirmClearConversation}
          ref={conversationRef}
        />
      </View>

      {/* Footer with controls */}
      <View style={styles.footer}>
        {/* Transcription display when recording */}
        {isRecording && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionText}>
              {transcription || 'Listening...'}
            </Text>
          </View>
        )}

        {/* Control buttons */}
        <View style={styles.controls}>
          {/* Auto-listen toggle */}
          <TouchableOpacity
            style={[
              styles.listenButton,
              isListening ? styles.listenButtonActive : null,
            ]}
            onPress={toggleListening}
          >
            <Icon
              name={isListening ? 'hearing' : 'hearing-disabled'}
              size={24}
              color={isListening ? colors.white : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Main record button */}
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording ? styles.recordButtonActive : null,
              (isProcessingAudio || isSpeaking) ? styles.recordButtonDisabled : null,
            ]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessingAudio || isSpeaking}
          >
            {isProcessingAudio ? (
              <ActivityIndicator color={colors.white} size="large" />
            ) : (
              <Icon
                name={isRecording ? 'stop' : 'mic'}
                size={32}
                color={colors.white}
              />
            )}
          </TouchableOpacity>

          {/* Clear conversation button */}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={confirmClearConversation}
          >
            <Icon name="clear-all" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: layout.spacing.medium,
  },

  footer: {
    padding: layout.spacing.medium,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...layout.shadows.medium,
  },

  transcriptionContainer: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: layout.spacing.medium,
    marginBottom: layout.spacing.medium,
  },

  transcriptionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },

  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...layout.shadows.medium,
  },

  recordButtonActive: {
    backgroundColor: colors.error,
  },

  recordButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },

  listenButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  listenButtonActive: {
    backgroundColor: colors.success,
  },

  clearButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default HomeScreen;
