/**
 * WebSocket Hook for AI Interview
 * Handles WebSocket connection and message flow for real-time AI interviews
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Message types matching backend schemas
export interface WSQuestionMessage {
  type: 'question';
  question_index: number;
  question_text: string;
  question_audio_url: string;
  total_questions: number;
  question_type: string;
  timestamp: string;
}

export interface WSStatusMessage {
  type: 'status';
  status: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface WSErrorMessage {
  type: 'error';
  error: string;
  code?: string;
  timestamp: string;
}

export interface WSCompletionMessage {
  type: 'completion';
  message: string;
  report_url?: string;
  overall_score?: number;
  timestamp: string;
}

export interface WSTranscriptionMessage {
  type: 'transcription';
  transcription: string;
  timestamp: string;
}

export type WSMessage = 
  | WSQuestionMessage 
  | WSStatusMessage 
  | WSErrorMessage 
  | WSCompletionMessage 
  | WSTranscriptionMessage;

export interface UseAIInterviewWebSocketOptions {
  interviewId: string;
  onQuestion?: (message: WSQuestionMessage) => void;
  onStatus?: (message: WSStatusMessage) => void;
  onError?: (message: WSErrorMessage) => void;
  onCompletion?: (message: WSCompletionMessage) => void;
  onTranscription?: (message: WSTranscriptionMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useAIInterviewWebSocket(options: UseAIInterviewWebSocketOptions) {
  const {
    interviewId,
    onQuestion,
    onStatus,
    onError,
    onCompletion,
    onTranscription,
    onConnect,
    onDisconnect,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<WSQuestionMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!interviewId) return;

    // Construct WebSocket URL
    let wsUrl: string;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (apiUrl) {
      // Parse API URL to extract host and protocol
      try {
        const url = new URL(apiUrl);
        const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProtocol}//${url.host}/api/tenant/ai-interview/ws/${interviewId}`;
      } catch {
        // Fallback if API_URL is malformed
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/api/tenant/ai-interview/ws/${interviewId}`;
      }
    } else {
      // Use current location as fallback
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/api/tenant/ai-interview/ws/${interviewId}`;
    }

    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        console.log('Received message:', message);
        
        // Add to messages history
        setMessages((prev) => [...prev, message]);

        // Handle different message types
        switch (message.type) {
          case 'question':
            setCurrentQuestion(message);
            onQuestion?.(message);
            break;
          case 'status':
            onStatus?.(message);
            break;
          case 'error':
            onError?.(message);
            break;
          case 'completion':
            onCompletion?.(message);
            break;
          case 'transcription':
            onTranscription?.(message);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      onDisconnect?.();
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [interviewId, onQuestion, onStatus, onError, onCompletion, onTranscription, onConnect, onDisconnect]);

  // Send text answer
  const sendTextAnswer = useCallback((answer: string, questionIndex: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    const message = {
      type: 'text_answer',
      answer,
      question_index: questionIndex,
      timestamp: new Date().toISOString(),
    };

    wsRef.current.send(JSON.stringify(message));
    return true;
  }, []);

  // Send audio answer (blob name)
  const sendAudioAnswer = useCallback((audioBlobName: string, questionIndex: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    const message = {
      type: 'audio_answer',
      audio_blob_name: audioBlobName,
      question_index: questionIndex,
      timestamp: new Date().toISOString(),
    };

    wsRef.current.send(JSON.stringify(message));
    return true;
  }, []);

  // Close connection
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return {
    isConnected,
    messages,
    currentQuestion,
    sendTextAnswer,
    sendAudioAnswer,
    disconnect,
  };
}
