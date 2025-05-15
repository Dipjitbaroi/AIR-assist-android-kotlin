/**
 * Audio Service
 *
 * Manages audio recording, playback, and processing for the app.
 * Coordinates between the native audio modules and provides a simplified API.
 */

import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
import Voice from '@react-native-community/voice';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { PermissionsService } from './PermissionsService';

// Enable Sound playback in silent mode (iOS)
Sound.setCategory('Playback', true);

/**
 * Service for managing audio recording and playback
 */
export class AudioService {
  static isRecording = false;
  static isInitialized = false;
  static recordOptions = null;
  static audioPath = null;
  static silenceTimer = null;
  static currentSound = null;
  static lastTranscription = '';
  static recordingConfig = {
    sampleRate: 44100,
    channels: 1,
    bitsPerSample: 16,
    audioSource: 6, // MIC source
    wavFile: 'recording.wav'
  };

  /**
   * Initialize the audio service
   *
   * @returns {Promise<void>} Promise that resolves when initialization is complete
   */
  static async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check microphone permission
      const hasMicPermission = await PermissionsService.hasMicrophonePermission();

      if (!hasMicPermission) {
        throw new Error('Microphone permission not granted');
      }

      // Configure Voice recognition
      Voice.onSpeechStart = this.handleSpeechStart.bind(this);
      Voice.onSpeechEnd = this.handleSpeechEnd.bind(this);
      Voice.onSpeechResults = this.handleSpeechResults.bind(this);
      Voice.onSpeechError = this.handleSpeechError.bind(this);

      // Configure AudioRecord
      await AudioRecord.init(this.recordingConfig);

      this.isInitialized = true;

      // Set up the audio file path
      const dirPath = Platform.select({
        ios: RNFS.DocumentDirectoryPath,
        android: RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath,
      });

      this.audioPath = `${dirPath}/recording.wav`;
    } catch (error) {
      console.error('AudioService: Initialization error', error);
      throw error;
    }
  }

  /**
   * Start recording audio
   *
   * @param {Object} options - Recording options
   * @param {boolean} options.detectSilence - Whether to automatically stop on silence
   * @param {number} options.silenceThreshold - Threshold for silence detection (0.0-1.0)
   * @param {boolean} options.useVoiceRecognition - Whether to use voice recognition
   * @param {Function} options.onSilenceDetected - Callback for silence detection
   * @param {Function} options.speechResultsCallback - Callback for speech recognition results
   * @returns {Promise<void>} Promise that resolves when recording starts
   */
  static async startRecording(options = {}) {
    try {
      // Initialize if needed
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.isRecording) {
        await this.stopRecording();
      }

      this.recordOptions = options;
      this.lastTranscription = '';

      // Start voice recognition if enabled
      if (options.useVoiceRecognition) {
        try {
          await Voice.start('en-US');
        } catch (error) {
          console.warn('AudioService: Voice recognition start error', error);
          // Continue even if voice recognition fails
        }
      }

      // Start audio recording
      AudioRecord.start();
      this.isRecording = true;

      // Set up silence detection if enabled
      if (options.detectSilence && options.onSilenceDetected) {
        this.startSilenceDetection(
          options.silenceThreshold || 0.2,
          options.onSilenceDetected
        );
      }
    } catch (error) {
      console.error('AudioService: Start recording error', error);
      throw error;
    }
  }

  /**
   * Stop recording audio
   *
   * @returns {Promise<Object>} Recording result object
   */
  static async stopRecording() {
    if (!this.isRecording) {
      return null;
    }

    try {
      // Stop silence detection timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      // Stop voice recognition
      try {
        await Voice.stop();
      } catch (error) {
        console.warn('AudioService: Voice recognition stop error', error);
        // Continue even if voice recognition stop fails
      }

      // Stop audio recording
      const audioBase64 = await AudioRecord.stop();
      this.isRecording = false;

      return {
        audioBase64,
        transcription: this.lastTranscription,
        path: this.audioPath,
      };
    } catch (error) {
      console.error('AudioService: Stop recording error', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Play audio from base64 data
   *
   * @param {string} base64Audio - Base64-encoded audio data
   * @returns {Promise<void>} Promise that resolves when playback completes
   */
  static async playAudio(base64Audio) {
    if (!base64Audio) {
      throw new Error('No audio data provided');
    }

    try {
      // Stop any current playback
      if (this.currentSound) {
        this.currentSound.stop();
        this.currentSound.release();
      }

      // Write base64 audio to file
      const filePath = `${RNFS.CachesDirectoryPath}/playback.wav`;
      await RNFS.writeFile(filePath, base64Audio, 'base64');

      // Create and play sound
      return new Promise((resolve, reject) => {
        this.currentSound = new Sound(filePath, '', (error) => {
          if (error) {
            console.error('AudioService: Sound load error', error);
            reject(error);
            return;
          }

          this.currentSound.play((success) => {
            if (success) {
              resolve();
            } else {
              reject(new Error('Playback failed'));
            }

            // Clean up
            this.currentSound.release();
            this.currentSound = null;
          });
        });
      });
    } catch (error) {
      console.error('AudioService: Play audio error', error);
      throw error;
    }
  }

  /**
   * Start silence detection
   *
   * @param {number} threshold - Threshold for silence detection (0.0-1.0)
   * @param {Function} callback - Callback when silence is detected
   */
  static startSilenceDetection(threshold, callback) {
    // Clear any existing timer
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    // Create silent detection subscription
    AudioRecord.on('data', (data) => {
      // Process audio data to detect silence
      // This is a simplified implementation - actual silence detection
      // would involve analyzing audio levels

      // For this example, we'll use a timer-based approach
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
      }

      this.silenceTimer = setTimeout(() => {
        if (this.isRecording && callback) {
          callback();
        }
      }, 2000); // 2 seconds of silence
    });
  }

  /**
   * Handle speech recognition start event
   */
  static handleSpeechStart() {
    // Speech recognition has started
    this.lastTranscription = '';
  }

  /**
   * Handle speech recognition end event
   */
  static handleSpeechEnd() {
    // Speech recognition has ended
  }

  /**
   * Handle speech recognition results event
   *
   * @param {Object} event - Speech recognition event
   */
  static handleSpeechResults(event) {
    if (event.value && event.value.length > 0) {
      // Get the most likely transcription
      this.lastTranscription = event.value[0];

      // Call callback if provided
      if (this.recordOptions && this.recordOptions.speechResultsCallback) {
        this.recordOptions.speechResultsCallback(this.lastTranscription);
      }
    }
  }

  /**
   * Handle speech recognition error event
   *
   * @param {Object} event - Speech recognition error event
   */
  static handleSpeechError(event) {
    console.warn('AudioService: Speech recognition error', event);
  }

  /**
   * Clean up resources used by the audio service
   */
  static cleanup() {
    if (this.isRecording) {
      this.stopRecording().catch(console.error);
    }

    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }

    Voice.destroy().catch(console.error);

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    this.isInitialized = false;
  }
}

export default AudioService;
