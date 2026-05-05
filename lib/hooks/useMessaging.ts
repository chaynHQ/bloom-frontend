'use client';

import {
  AgentReplyPayload,
  ChatMessage,
  ConnectionState,
  HistoryEntry,
} from '@/components/messaging/types';
import { getAuthToken } from '@/lib/auth';
import { CHAT_MESSAGE_RECEIVED, CHAT_MESSAGE_SENT } from '@/lib/constants/events';
import { auth } from '@/lib/firebase';
import logEvent from '@/lib/utils/logEvent';
import { useRollbar } from '@rollbar/react';
import { onIdTokenChanged } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/common';

export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25 MB

interface UseMessagingResult {
  messages: ChatMessage[];
  connectionState: ConnectionState;
  sendText: (text: string) => void;
  sendAttachment: (
    file: File | Blob,
    kind: 'image' | 'voice',
    displayText: string,
  ) => Promise<void>;
  markAsRead: () => Promise<void>;
}

// Max gap (ms) between an optimistic message's timestamp and the server's version
// when deciding whether they represent the same message during history reconciliation.
const OPTIMISTIC_RECONCILE_MS = 10_000;

const MESSAGING_ENDPOINTS = {
  read: `${API_URL}/front-chat/read`,
  attachments: `${API_URL}/front-chat/attachments`,
  socketNs: '/front-chat',
} as const;

const getSocketOrigin = (): string => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return '';
  }
};

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

// Cypress can't use a real WebSocket — this stub lets tests drive socket events via window.__messagingSocket
type CypressSocketStub = {
  connected: boolean;
  on: (event: string, cb: (...args: unknown[]) => void) => CypressSocketStub;
  emit: (event: string, ...args: unknown[]) => CypressSocketStub;
  timeout: (ms: number) => CypressSocketStub;
  disconnect: () => void;
  trigger: (event: string, payload?: unknown) => void;
};

function createCypressStubSocket(): CypressSocketStub {
  const handlers: Record<string, (...args: unknown[]) => void> = {};
  const stub: CypressSocketStub = {
    connected: false,
    on(event, cb) {
      handlers[event] = cb;
      return stub;
    },
    emit(event, ...args) {
      if (event === 'send_message') {
        const ack = args[args.length - 1];
        if (typeof ack === 'function')
          (ack as (err: null, res: { ok: true }) => void)(null, { ok: true });
      }
      return stub;
    },
    timeout() {
      return stub;
    },
    disconnect() {
      stub.connected = false;
    },
    trigger(event, payload) {
      handlers[event]?.(payload);
    },
  };
  return stub;
}

export function useMessaging(): UseMessagingResult {
  const rollbar = useRollbar();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const socketRef = useRef<Socket | null>(null);
  // Tracks agent message IDs to prevent duplicates when Front retries a webhook delivery.
  const seenAgentIdsRef = useRef<Set<string>>(new Set());
  const markAsReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    const prev = prevMessagesRef.current;
    prevMessagesRef.current = messages;
    for (const m of prev) {
      if (!m.previewUrl) continue;
      if (!messages.some((c) => c.previewUrl === m.previewUrl)) {
        URL.revokeObjectURL(m.previewUrl);
      }
    }
  }, [messages]);

  const upsertMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const existing = prev.findIndex((m) => m.id === message.id);
      if (existing === -1) return [...prev, message];
      const next = prev.slice();
      next[existing] = message;
      return next;
    });
  }, []);

  const mergeHistoryEntries = useCallback((entries: HistoryEntry[]) => {
    setMessages((prev) => {
      const knownIds = new Set(prev.map((m) => m.id));
      const next: ChatMessage[] = prev.slice();

      for (const serverMsg of entries) {
        if (knownIds.has(serverMsg.id)) continue;

        const optimisticIdx = next.findIndex(
          (local) =>
            local.direction === serverMsg.direction &&
            local.text === serverMsg.text &&
            Math.abs(local.createdAt - serverMsg.createdAt) < OPTIMISTIC_RECONCILE_MS &&
            !local.id.startsWith('msg_'),
        );

        const seeded: ChatMessage = {
          id: serverMsg.id,
          direction: serverMsg.direction,
          kind: serverMsg.kind ?? 'text',
          text: serverMsg.text,
          authorName: serverMsg.authorName,
          createdAt: serverMsg.createdAt,
          status: 'sent',
          ...(serverMsg.attachmentUrl && { attachmentUrl: `${API_URL}${serverMsg.attachmentUrl}` }),
        };

        if (optimisticIdx >= 0) {
          next[optimisticIdx] = seeded;
        } else {
          next.push(seeded);
        }
        knownIds.add(serverMsg.id);
        if (serverMsg.direction === 'agent') seenAgentIdsRef.current.add(serverMsg.id);
      }

      return next.sort((a, b) => a.createdAt - b.createdAt);
    });
  }, []);

  const markAsRead = useCallback(async () => {
    const { token, error } = await getAuthToken();
    if (!token || error) return;
    try {
      await fetch(MESSAGING_ENDPOINTS.read, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Fire-and-forget — read receipt failure is non-critical
    }
  }, []);

  const sendText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const socket = socketRef.current;
      const id = generateId();
      const optimistic: ChatMessage = {
        id,
        direction: 'user',
        kind: 'text',
        text: trimmed,
        createdAt: Date.now(),
        status: 'sending',
      };
      upsertMessage(optimistic);

      if (!socket || !socket.connected) {
        upsertMessage({ ...optimistic, status: 'failed' });
        return;
      }

      socket
        .timeout(10_000)
        .emit('send_message', { text: trimmed }, (timeoutErr: Error | null, ack: unknown) => {
          if (timeoutErr || !(ack as { ok?: boolean })?.ok) {
            upsertMessage({ ...optimistic, status: 'failed' });
            return;
          }
          upsertMessage({ ...optimistic, status: 'sent' });
          logEvent(CHAT_MESSAGE_SENT, { kind: 'text' });
        });
    },
    [upsertMessage],
  );

  const sendAttachment = useCallback(
    async (file: File | Blob, kind: 'image' | 'voice', displayText: string) => {
      const id = generateId();
      const previewUrl =
        kind === 'image' && file instanceof File ? URL.createObjectURL(file) : undefined;
      const optimistic: ChatMessage = {
        id,
        direction: 'user',
        kind,
        text: file instanceof File ? file.name : displayText,
        previewUrl,
        createdAt: Date.now(),
        status: 'sending',
      };
      upsertMessage(optimistic);

      if (file.size > MAX_ATTACHMENT_BYTES) {
        upsertMessage({ ...optimistic, status: 'failed' });
        throw new Error('FILE_TOO_LARGE');
      }

      const { token, error } = await getAuthToken();
      if (!token || error) {
        upsertMessage({ ...optimistic, status: 'failed' });
        throw new Error('AUTH_FAILED');
      }

      const form = new FormData();
      const filename =
        file instanceof File ? file.name : kind === 'voice' ? 'voice-note.webm' : 'image';
      form.append('file', file, filename);

      try {
        const response = await fetch(MESSAGING_ENDPOINTS.attachments, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!response.ok) throw new Error(`UPLOAD_FAILED_${response.status}`);
        upsertMessage({ ...optimistic, status: 'sent' });
        logEvent(CHAT_MESSAGE_SENT, { kind });
      } catch (err) {
        upsertMessage({ ...optimistic, status: 'failed' });
        rollbar.warning('Messaging attachment upload failed', {
          message: (err as Error).message,
        });
        throw err;
      }
    },
    [rollbar, upsertMessage],
  );

  useEffect(() => {
    const origin = getSocketOrigin();
    if (!origin) {
      setConnectionState('error');
      return;
    }

    let activeSocket: Socket | null = null;

    const tearDown = () => {
      activeSocket?.disconnect();
      activeSocket = null;
      socketRef.current = null;
      if (markAsReadTimerRef.current) {
        clearTimeout(markAsReadTimerRef.current);
        markAsReadTimerRef.current = null;
      }
    };

    const buildSocket = () => {
      setConnectionState('connecting');
      let socket: Socket;
      if (typeof window !== 'undefined' && !!(window as any).Cypress) {
        const stub = createCypressStubSocket();
        (window as any).__messagingSocket = stub;
        socket = stub as unknown as Socket;
      } else {
        socket = io(`${origin}${MESSAGING_ENDPOINTS.socketNs}`, {
          auth: async (cb) => {
            const { token } = await getAuthToken();
            cb({ token: token ?? '' });
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 10000,
        });
      }
      activeSocket = socket;
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnectionState('connected');
      });
      socket.on('disconnect', () => setConnectionState('disconnected'));
      socket.on('connect_error', (err) => {
        rollbar.warning('Messaging connect_error', { message: err.message });
        setConnectionState('error');
      });

      socket.on('history', (payload: { messages: HistoryEntry[] }) => {
        if (!payload?.messages?.length) return;
        mergeHistoryEntries(payload.messages);
      });

      socket.on('agent_reply', (payload: AgentReplyPayload) => {
        if (!payload || typeof payload.body !== 'string') return;
        const id = payload.id ?? generateId();
        if (seenAgentIdsRef.current.has(id)) return;
        seenAgentIdsRef.current.add(id);
        upsertMessage({
          id,
          direction: 'agent',
          kind: payload.kind ?? 'text',
          text: payload.body,
          authorName: payload.authorName,
          // Backend sends seconds (matching Front's emitted_at convention); multiply to get ms.
          createdAt: payload.emittedAt ? payload.emittedAt * 1000 : Date.now(),
          status: 'sent',
          ...(payload.attachmentUrl && { attachmentUrl: `${API_URL}${payload.attachmentUrl}` }),
        });
        logEvent(CHAT_MESSAGE_RECEIVED, { kind: payload.kind ?? 'text' });
        if (markAsReadTimerRef.current) clearTimeout(markAsReadTimerRef.current);
        markAsReadTimerRef.current = setTimeout(() => markAsRead(), 500);
      });
    };

    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        tearDown();
        setMessages((prev) => {
          prev.forEach((m) => {
            if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
          });
          return [];
        });
        seenAgentIdsRef.current.clear();
        setConnectionState('idle');
        return;
      }
      if (!activeSocket) buildSocket();
    });

    return () => {
      unsubscribe();
      tearDown();
    };
  }, [rollbar, upsertMessage, mergeHistoryEntries, markAsRead]);

  return { messages, connectionState, sendText, sendAttachment, markAsRead };
}
