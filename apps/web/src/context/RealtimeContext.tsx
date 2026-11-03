import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';

export interface RealtimeEvent<T = any> {
  eventId: string;
  type: string;
  scope?: string;
  target?: string;
  timestamp: string;
  payload: T;
}

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface RealtimeContextType {
  status: RealtimeStatus;
  onlineCount: number;
  send: (type: string, payload?: any, extra?: { conversationId?: number | string; recipientId?: number | string }) => void;
  on: (eventType: string, handler: (event: RealtimeEvent) => void) => () => void;
  playNotificationSound: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Web Audio API chime - zero external asset dependencies, 100% reliable
const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.35);
  } catch (err) {
    // Ignore audio autoplay restrictions if user has not interacted with DOM yet
  }
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>('disconnected');
  const [onlineCount, setOnlineCount] = useState<number>(1);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const listenersRef = useRef<Map<string, Set<(event: RealtimeEvent) => void>>>(new Map());
  const pingIntervalRef = useRef<number | null>(null);

  // Subscribe to specific event types
  const on = useCallback((eventType: string, handler: (event: RealtimeEvent) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(handler);

    return () => {
      const set = listenersRef.current.get(eventType);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  // Send message through WebSocket
  const send = useCallback((type: string, payload?: any, extra?: { conversationId?: number | string; recipientId?: number | string }) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const msg = {
        type,
        conversationId: extra?.conversationId ? Number(extra.conversationId) : undefined,
        recipientId: extra?.recipientId ? Number(extra.recipientId) : undefined,
        payload,
      };
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // Core WebSocket dispatch listener & TanStack Query cache synchronization
  const handleEventDispatched = useCallback((event: RealtimeEvent) => {
    // 1. Notify local subscribers
    const handlers = listenersRef.current.get(event.type);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(event);
        } catch (e) {
          console.error(`Error in realtime handler for ${event.type}:`, e);
        }
      });
    }

    // Also notify wildcard '*' listeners
    const wildcardHandlers = listenersRef.current.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((h) => {
        try {
          h(event);
        } catch (e) {
          console.error('Error in realtime wildcard handler:', e);
        }
      });
    }

    // 2. Intelligent TanStack Query Cache Invalidation based on Event Type
    switch (event.type) {
      case 'NOTIFICATION_NEW':
      case 'NOTIFICATION_READ':
      case 'NOTIFICATION_ALL_READ':
      case 'NOTIFICATION_DELETED':
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        if (event.type === 'NOTIFICATION_NEW') {
          playChimeSound();
        }
        break;

      case 'CHAT_MESSAGE_RECEIVED':
      case 'CHAT_MESSAGE_SENT':
      case 'CHAT_MESSAGE_DELETED':
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        if (event.payload?.conversationId) {
          queryClient.invalidateQueries({ queryKey: ['messages', String(event.payload.conversationId)] });
        }
        if (event.type === 'CHAT_MESSAGE_RECEIVED') {
          playChimeSound();
        }
        break;

      case 'MODERATION_NEW_REPORT':
      case 'REPORT_RESOLVED_SYNC':
        queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-reports'] });
        queryClient.invalidateQueries({ queryKey: ['moderator', 'reports'] });
        if (event.type === 'MODERATION_NEW_REPORT') {
          playChimeSound();
        }
        break;

      case 'VERIFICATION_NEW_REQUEST':
        queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
        queryClient.invalidateQueries({ queryKey: ['staff', 'verifications'] });
        playChimeSound();
        break;

      case 'TICKET_UPDATED':
      case 'TICKET_REPLIED':
      case 'STAFF_TICKET_ALERT':
        queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] });
        queryClient.invalidateQueries({ queryKey: ['student', 'support-tickets'] });
        queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
        if (event.payload?.ticketId) {
          queryClient.invalidateQueries({ queryKey: ['support-ticket', String(event.payload.ticketId)] });
        }
        playChimeSound();
        break;

      case 'OFFICIAL_BROADCAST_ALERT':
        queryClient.invalidateQueries({ queryKey: ['student', 'broadcasts'] });
        queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
        playChimeSound();
        break;

      case 'CONTENT_INTERACTION':
        if (event.payload?.targetType === 'QUESTION') {
          queryClient.invalidateQueries({ queryKey: ['questions'] });
          queryClient.invalidateQueries({ queryKey: ['question', String(event.payload.targetId)] });
        } else if (event.payload?.targetType === 'ARTICLE') {
          queryClient.invalidateQueries({ queryKey: ['articles'] });
          queryClient.invalidateQueries({ queryKey: ['article', String(event.payload.targetId)] });
        }
        break;

      case 'ADMIN_DASHBOARD_PULSE':
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
        break;

      case 'AUDIT_LOG_APPENDED':
        queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
        break;

      case 'SYSTEM_CONNECTED':
        if (event.payload?.activeConnections) {
          setOnlineCount(event.payload.activeConnections);
        }
        break;

      default:
        break;
    }
  }, [queryClient]);

  // Connect to WebSocket Server
  const connect = useCallback(() => {
    if (!isAuthenticated || !currentUser) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setStatus('disconnected');
      return;
    }

    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');

    const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token') || '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/communication/ws?token=${encodeURIComponent(token)}&userId=${currentUser.id}&role=${encodeURIComponent(currentUser.role || 'Student')}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Periodic ping heartbeat to prevent network timeout
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'HEARTBEAT_PING' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const lines = event.data.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            const parsed: RealtimeEvent = JSON.parse(line);
            handleEventDispatched(parsed);
          }
        } catch (err) {
          console.warn('Failed to parse WebSocket packet:', err);
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Exponential backoff reconnect
        const attempts = reconnectAttemptsRef.current;
        const delay = Math.min(1000 * Math.pow(1.5, attempts), 10000);
        reconnectAttemptsRef.current += 1;

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        setStatus('error');
        ws.close();
      };
    } catch (err) {
      console.warn('WebSocket initialization failed:', err);
      setStatus('error');
    }
  }, [isAuthenticated, currentUser, handleEventDispatched]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return (
    <RealtimeContext.Provider
      value={{
        status,
        onlineCount,
        send,
        on,
        playNotificationSound: playChimeSound,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
