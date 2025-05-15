/**
 * App Context
 *
 * Provides global state management for the application.
 * Manages WebSocket connection, messages, settings, and audio processing state.
 */

import React, { createContext, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketService } from '../services/WebSocketService';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

// Create the context
export const AppContext = createContext();

/**
 * App Provider Component
 * Provides app state and functions to the application
 *
 * @param {Object} props - Component properties
 * @param {ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const AppProvider = ({ children }) => {
  // App state
  const [appState, setAppState] = useState(AppState.currentState);
  const [isOnline, setIsOnline] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState([]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscription, setLastTranscription] = useState('');

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    const loadPendingMessages = async () => {
      try {
        const savedPendingMessages = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_MESSAGES);
        if (savedPendingMessages) {
          setPendingMessages(JSON.parse(savedPendingMessages));
        }
      } catch (error) {
        console.error('Error loading pending messages:', error);
      }
    };

    const loadConversationHistory = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    };

    loadSettings();
    loadPendingMessages();
    loadConversationHistory();
  }, []);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [settings]);

  // Save pending messages to AsyncStorage when they change
  useEffect(() => {
    const savePendingMessages = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_MESSAGES, JSON.stringify(pendingMessages));
      } catch (error) {
        console.error('Error saving pending messages:', error);
      }
    };

    savePendingMessages();
  }, [pendingMessages]);

  // Save conversation history to AsyncStorage when messages change
  useEffect(() => {
    const saveConversationHistory = async () => {
      try {
        // Only keep the last 100 messages to prevent storage overflow
        const messagesToSave = messages.slice(-100);
        await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(messagesToSave));
      } catch (error) {
        console.error('Error saving conversation history:', error);
      }
    };

    saveConversationHistory();
  }, [messages]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        WebSocketService.checkConnection();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        WebSocketService.init(settings.wsServerUrl);
        WebSocketService.onConnect(() => {
          setWsConnected(true);
          addMessage('Connected to AI assistant', false, 'system');
        });

        WebSocketService.onDisconnect(() => {
          setWsConnected(false);
          if (isOnline) {
            addMessage('Disconnected from AI assistant', false, 'system');
          }
        });

        WebSocketService.onMessage(handleWebSocketMessage);
        WebSocketService.onError((error) => {
          console.error('WebSocket error:', error);
          addMessage('Error connecting to AI assistant', false, 'system');
        });
      } catch (error) {
        console.error('WebSocket initialization error:', error);
        setWsConnected(false);
      }
    };

    initWebSocket();

    return () => {
      WebSocketService.disconnect();
    };
  }, [settings.wsServerUrl, isOnline]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'aiResponse') {
        // Update last user message with transcription if available
        if (data.transcription && data.messageId) {
          setLastTranscription(data.transcription);
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === data.messageId
                ? { ...msg, text: data.transcription }
                : msg
            )
          );
        }

        // Add AI response to messages
        const aiResponseId = addMessage(data.text, false);
        setIsSpeaking(true);

        // Play audio if available
        if (data.audioBase64) {
          // AudioService would handle this
          // After playback finishes, set isSpeaking to false
          setTimeout(() => {
            setIsSpeaking(false);
          }, 1000); // This would be replaced with actual audio completion callback
        } else {
          setIsSpeaking(false);
        }

        setIsProcessingAudio(false);
      } else if (data.type === 'pong') {
        // Handle pong message - keep connection alive
      } else if (data.type === 'error') {
        addMessage(`Error: ${data.message}`, false, 'system');
        setIsProcessingAudio(false);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };

  // Add a message to the conversation
  const addMessage = (text, isUser, type = 'normal', id = Date.now().toString()) => {
    const newMessage = {
      id,
      text,
      isUser,
      type,
      timestamp: Date.now(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage.id;
  };

  // Send audio to the WebSocket server
  const sendAudioToServer = async (audioBase64, transcription = '') => {
    try {
      setIsProcessingAudio(true);
      const messageId = Date.now().toString();

      // If we have a transcription, use it, otherwise show processing
      const displayText = transcription || 'Listening...';
      const userMessageId = addMessage(displayText, true);

      if (wsConnected) {
        WebSocketService.send(JSON.stringify({
          type: 'audioMessage',
          audio: audioBase64,
          transcription: transcription,
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: Date.now(),
          messageId: userMessageId,
        }));
      } else {
        // Store for later sending when connection is restored
        setPendingMessages(prev => [...prev, {
          audioBase64,
          transcription,
          timestamp: Date.now(),
          messageId: userMessageId,
        }]);

        // Update user message with offline indicator
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === userMessageId
              ? { ...msg, text: transcription || 'Message saved for when connection is restored' }
              : msg
          )
        );

        addMessage('I\'m currently offline. I\'ll process your message when I reconnect.', false, 'system');
        setIsProcessingAudio(false);
      }

      return userMessageId;
    } catch (error) {
      console.error('Error sending audio to server:', error);
      addMessage('Error: Could not process audio. Please try again.', false, 'system');
      setIsProcessingAudio(false);
      return null;
    }
  };

  // Send text to the WebSocket server (for typing)
  const sendTextToServer = async (text) => {
    try {
      const messageId = Date.now().toString();
      const userMessageId = addMessage(text, true);

      if (wsConnected) {
        WebSocketService.send(JSON.stringify({
          type: 'textMessage',
          text: text,
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: Date.now(),
          messageId: userMessageId,
        }));

        return userMessageId;
      } else {
        // Store for later sending
        setPendingMessages(prev => [...prev, {
          text,
          isText: true,
          timestamp: Date.now(),
          messageId: userMessageId,
        }]);

        addMessage('I\'m currently offline. I\'ll process your message when I reconnect.', false, 'system');
        return userMessageId;
      }
    } catch (error) {
      console.error('Error sending text to server:', error);
      addMessage('Error: Could not send your message. Please try again.', false, 'system');
      return null;
    }
  };

  // Process any pending messages
  const processPendingMessages = async () => {
    if (!wsConnected || pendingMessages.length === 0) return;

    try {
      addMessage('Processing your offline messages...', false, 'system');

      // Only process the first pending message to avoid overloading
      const [firstPending, ...remainingPending] = pendingMessages;
      setPendingMessages(remainingPending);

      // Send the message to the server
      if (firstPending.isText) {
        WebSocketService.send(JSON.stringify({
          type: 'textMessage',
          text: firstPending.text,
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: firstPending.timestamp,
          messageId: firstPending.messageId,
        }));
      } else {
        WebSocketService.send(JSON.stringify({
          type: 'audioMessage',
          audio: firstPending.audioBase64,
          transcription: firstPending.transcription || '',
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: firstPending.timestamp,
          messageId: firstPending.messageId,
        }));
      }

      setIsProcessingAudio(true);
    } catch (error) {
      console.error('Error processing pending messages:', error);
    }
  };

  // Update connection status when WebSocket connection changes
  useEffect(() => {
    if (wsConnected && pendingMessages.length > 0) {
      processPendingMessages();
    }
  }, [wsConnected, pendingMessages]);

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        wsConnected,
        settings,
        messages,
        isProcessingAudio,
        isSpeaking,
        pendingMessages,
        lastTranscription,
        updateSettings,
        addMessage,
        sendAudioToServer,
        sendTextToServer,
        clearConversation,
        processPendingMessages,
        setIsProcessingAudio,
        setIsSpeaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
