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

export type NotificationSoundType = 'messenger' | 'discord' | 'classic';

interface RealtimeContextType {
  status: RealtimeStatus;
  onlineCount: number;
  send: (type: string, payload?: any, extra?: { conversationId?: number | string; recipientId?: number | string }) => void;
  on: (eventType: string, handler: (event: RealtimeEvent) => void) => () => void;
  playNotificationSound: (overrideType?: NotificationSoundType) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  soundType: NotificationSoundType;
  setSoundType: (type: NotificationSoundType) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Web Audio API Sound Synthesizers - zero external asset dependencies, 100% reliable
const playMessengerChime = (ctx: AudioContext) => {
  const now = ctx.currentTime;

  // Initial bright marimba tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1318.5, now); // E6
  osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08);

  gain1.gain.setValueAtTime(0.22, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.12);

  // Follow-up ping
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1760, now + 0.07); // A6
  osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.18);

  gain2.gain.setValueAtTime(0.28, now + 0.07);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.07);
  osc2.stop(now + 0.22);
};

const playDiscordChime = (ctx: AudioContext) => {
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(987.77, now); // B5
  gain1.gain.setValueAtTime(0.18, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.09);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
  gain2.gain.setValueAtTime(0.24, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.24);
};

const playClassicChime = (ctx: AudioContext) => {
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

  gainNode.gain.setValueAtTime(0.1, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.15);
  osc2.start(now + 0.15);
  osc2.stop(now + 0.35);
};

const getWebSocketUrl = (token: string, userId: string | number, role: string): string => {
  const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
  let wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  let wsHost = window.location.host;

  // In production or when VITE_API_URL is configured
  if (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://')) {
    try {
      const u = new URL(rawApiUrl);
      wsProtocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
      wsHost = u.host;
    } catch {
      // fallback
    }
  } else if (typeof window !== 'undefined' && window.location.hostname.endsWith('fhub.com.vn')) {
    // In production on Cloudflare Pages / fhub.com.vn domain, API is hosted on api.fhub.com.vn
    wsProtocol = 'wss:';
    wsHost = 'api.fhub.com.vn';
  }

  return `${wsProtocol}//${wsHost}/api/communication/ws?token=${encodeURIComponent(token)}&userId=${userId}&role=${encodeURIComponent(role)}`;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>('disconnected');
  const [onlineCount, setOnlineCount] = useState<number>(1);

  // Sound settings
  const [isSoundEnabled, setIsSoundEnabledState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('fhub_sound_enabled');
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  });

  const [soundType, setSoundTypeState] = useState<NotificationSoundType>(() => {
    try {
      const v = localStorage.getItem('fhub_sound_type');
      return (v === 'discord' || v === 'classic' || v === 'messenger') ? v : 'messenger';
    } catch {
      return 'messenger';
    }
  });

  const setIsSoundEnabled = useCallback((enabled: boolean) => {
    setIsSoundEnabledState(enabled);
    try {
      localStorage.setItem('fhub_sound_enabled', String(enabled));
    } catch {}
  }, []);

  const setSoundType = useCallback((type: NotificationSoundType) => {
    setSoundTypeState(type);
    try {
      localStorage.setItem('fhub_sound_type', type);
    } catch {}
  }, []);

  const lastPlayedRef = useRef<number>(0);

  const playNotificationSound = useCallback((overrideType?: NotificationSoundType) => {
    const targetType = overrideType || soundType;
    if (!overrideType && !isSoundEnabled) return;

    const now = Date.now();
    if (now - lastPlayedRef.current < 250 && !overrideType) return;
    lastPlayedRef.current = now;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (targetType === 'discord') {
        playDiscordChime(ctx);
      } else if (targetType === 'classic') {
        playClassicChime(ctx);
      } else {
        playMessengerChime(ctx);
      }
    } catch {
      // Ignore audio restrictions
    }
  }, [isSoundEnabled, soundType]);

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
          playNotificationSound();
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
          playNotificationSound();
        }
        break;

      case 'MODERATION_NEW_REPORT':
      case 'REPORT_RESOLVED_SYNC':
        queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-reports'] });
        queryClient.invalidateQueries({ queryKey: ['moderator', 'reports'] });
        if (event.type === 'MODERATION_NEW_REPORT') {
          playNotificationSound();
        }
        break;

      case 'VERIFICATION_NEW_REQUEST':
        queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
        queryClient.invalidateQueries({ queryKey: ['staff', 'verifications'] });
        playNotificationSound();
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
        playNotificationSound();
        break;

      case 'OFFICIAL_BROADCAST_ALERT':
        queryClient.invalidateQueries({ queryKey: ['student', 'broadcasts'] });
        queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
        playNotificationSound();
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

    const token = localStorage.getItem('fhub_token') || sessionStorage.getItem('fhub_token') || '';
    if (!token) {
      setStatus('disconnected');
      return;
    }

    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');

    const wsUrl = getWebSocketUrl(token, currentUser.id, currentUser.role || 'Student');

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
          // ignore malformed frame
        }
      };

      ws.onclose = () => {
        setStatus('disconnected');
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Exponential backoff reconnect (capped at 5 attempts to prevent console flooding)
        if (reconnectAttemptsRef.current < 5) {
          const attempts = reconnectAttemptsRef.current;
          const delay = Math.min(2000 * Math.pow(1.6, attempts), 25000);
          reconnectAttemptsRef.current += 1;

          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        } else {
          // Fallback polling mode
          setStatus('disconnected');
        }
      };

      ws.onerror = () => {
        setStatus('error');
      };
    } catch (err) {
      setStatus('error');
    }
  }, [isAuthenticated, currentUser, handleEventDispatched]);

  useEffect(() => {
    connect();

    // Auto-reconnect when user refocuses tab or device comes online
    const handleReactivate = () => {
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        reconnectAttemptsRef.current = 0;
        connect();
      }
    };

    window.addEventListener('online', handleReactivate);
    window.addEventListener('focus', handleReactivate);

    return () => {
      window.removeEventListener('online', handleReactivate);
      window.removeEventListener('focus', handleReactivate);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        const s = socketRef.current;
        socketRef.current = null;
        if (s.readyState === WebSocket.OPEN) {
          s.close(1000, 'Unmount');
        } else if (s.readyState === WebSocket.CONNECTING) {
          s.onopen = () => s.close(1000, 'Unmount');
          s.onerror = () => {};
          s.onclose = () => {};
        }
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
        playNotificationSound,
        isSoundEnabled,
        setIsSoundEnabled,
        soundType,
        setSoundType,
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
