/**
 * React Hook for AI Chatbot
 * Handles communication with the chatbot backend API
 */

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatbotMetadata {
  model?: string;
  tokens_used?: number;
  confidence?: number;
}

export interface ChatbotResponse {
  response: string;
  conversation_id: string;
  timestamp: string;
  metadata?: ChatbotMetadata;
}

export const useChatbot = () => {
  const { user, isSignedIn } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send a message to the chatbot
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || messageText.length > 2000) {
      setError('Message must be between 1 and 2000 characters');
      return;
    }

    if (!isSignedIn) {
      setError('Please sign in to use the chatbot');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Use test endpoint (no auth required) - matching scan API pattern
      const response = await fetch('http://localhost:8000/api/test/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          conversation_id: conversationId,
          user_id: user?.id || 'test_user_123'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorDetail = errorData.detail || errorData.message || '';
        
        if (response.status === 404) {
          throw new Error('⏳ Test endpoint not ready yet. The backend team is setting up /api/test/chatbot endpoints. Please try again in a few minutes.');
        } else if (response.status === 503) {
          throw new Error('AI assistant is temporarily unavailable. Please try again later.');
        } else if (response.status === 500) {
          if (errorDetail.toLowerCase().includes('openai')) {
            throw new Error('🤖 OpenAI Configuration Needed: The backend needs OPENAI_API_KEY to be configured in environment variables.');
          }
          throw new Error(errorData.detail || 'AI service error. Please check backend logs.');
        } else {
          throw new Error(errorDetail || 'Failed to get response from AI assistant');
        }
      }

      const data: ChatbotResponse = await response.json();

      // Save conversation ID from first response
      if (!conversationId) {
        setConversationId(data.conversation_id);
        // Store in localStorage for persistence
        localStorage.setItem('chatConversationId', data.conversation_id);
      }

      // Add AI response to messages
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message. Please try again.';
      setError(errorMessage);
      console.error('Chatbot error:', err);
      
      // Add a simple error message to chat (detailed error is in Alert above)
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't process your message. Please check the alert above for details.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isSignedIn, user]);

  // Load conversation history
  const loadHistory = useCallback(async (convId: string) => {
    if (!isSignedIn) return;

    try {
      // Use test endpoint (no auth required)
      const response = await fetch(
        `http://localhost:8000/api/test/chatbot/history?conversation_id=${convId}&limit=50`,
        {
          headers: { 
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        // Silently fail for history loading - don't disrupt user experience
        console.warn('Failed to load conversation history:', response.status);
        return;
      }

      const data = await response.json();
      setMessages(data.messages);
      setConversationId(data.conversation_id);
    } catch (err) {
      console.error('Failed to load history:', err);
      // Don't show error to user for history load failures
    }
  }, [isSignedIn]);

  // Check chatbot availability
  const checkStatus = useCallback(async () => {
    try {
      // Use test endpoint (no auth required)
      const response = await fetch('http://localhost:8000/api/test/chatbot/status');
      const data = await response.json();
      return data.available;
    } catch (err) {
      console.error('Failed to check chatbot status:', err);
      return false;
    }
  }, []);

  // Clear conversation and start new
  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    localStorage.removeItem('chatConversationId');
  }, []);

  // Load conversation from localStorage
  const loadConversationFromStorage = useCallback((convId: string) => {
    try {
      const storedMessages = localStorage.getItem(`chat_messages_${convId}`);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        setMessages(parsed);
        setConversationId(convId);
        localStorage.setItem('chatConversationId', convId);
      }
    } catch (err) {
      console.error('Failed to load conversation from storage:', err);
      setError('Failed to load conversation');
    }
  }, []);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConvId = localStorage.getItem('chatConversationId');
      if (savedConvId) {
        setConversationId(savedConvId);
        // Load history asynchronously
        loadHistory(savedConvId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    messages,
    conversationId,
    isLoading,
    error,
    sendMessage,
    loadHistory,
    loadConversationFromStorage,
    checkStatus,
    startNewConversation,
    clearError: () => setError(null)
  };
};

