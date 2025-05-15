/**
 * Conversation Component
 *
 * Displays the conversation history between the user and the AI assistant.
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import { colors } from '../styles/colors';
import { layout } from '../styles/layout';
import { typography } from '../styles/typography';

/**
 * Message Bubble Component
 *
 * @param {Object} props - Component properties
 * @param {Object} props.message - Message object
 * @returns {React.ReactElement} Rendered component
 */
const MessageBubble = ({ message }) => {
  const isUser = message.isUser;
  const isSystem = message.type === 'system';

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.aiBubble,
        isSystem && styles.systemBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          isUser ? styles.userText : styles.aiText,
          isSystem && styles.systemText,
        ]}
      >
        {message.text}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

/**
 * Conversation Component
 *
 * @param {Object} props - Component properties
 * @param {Array} props.messages - Array of message objects
 * @param {Function} props.onClearConversation - Clear conversation handler
 * @returns {React.ReactElement} Rendered component
 */
const Conversation = forwardRef(({ messages, onClearConversation }, ref) => {
  return (
    <View style={styles.container}>
      {/* Conversation header */}
      <View style={styles.header}>
        <Text style={styles.title}>Conversation</Text>
        {messages.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearConversation}
          >
            <Icon name="delete" size={18} color={colors.error} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={ref}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="chat" size={48} color={colors.border} />
            <Text style={styles.emptyText}>
              Your conversation with the AI assistant will appear here.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </ScrollView>
    </View>
  );
});

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: layout.spacing.small,
  },

  title: {
    ...typography.headingSmall,
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.spacing.small,
  },

  clearButtonText: {
    ...typography.labelSmall,
    color: colors.error,
    marginLeft: layout.spacing.tiny,
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    paddingVertical: layout.spacing.small,
  },

  messageBubble: {
    maxWidth: '80%',
    padding: layout.spacing.medium,
    borderRadius: layout.borderRadius.medium,
    marginBottom: layout.spacing.medium,
    ...layout.shadows.small,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 0,
  },

  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundLight,
    borderBottomLeftRadius: 0,
  },

  systemBubble: {
    alignSelf: 'center',
    backgroundColor: colors.backgroundDark,
    borderRadius: layout.borderRadius.medium,
    maxWidth: '90%',
  },

  messageText: {
    ...typography.bodyMedium,
  },

  userText: {
    color: colors.white,
  },

  aiText: {
    color: colors.textPrimary,
  },

  systemText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  timestamp: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: layout.spacing.tiny,
    alignSelf: 'flex-end',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.spacing.xlarge,
  },

  emptyText: {
    ...typography.bodyMedium,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: layout.spacing.medium,
  },
});

export default Conversation;
