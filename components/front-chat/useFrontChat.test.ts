import { act, renderHook, waitFor } from '@testing-library/react';

const mockGetAuthToken = jest.fn();
const mockUseRollbar = jest.fn(() => ({ warning: jest.fn(), error: jest.fn() }));
const mockOnIdTokenChanged = jest.fn();

jest.mock('@/lib/auth', () => ({
  getAuthToken: (...args: unknown[]) => mockGetAuthToken(...args),
}));
jest.mock('@/lib/firebase', () => ({ auth: { fakeAuth: true } }));
jest.mock('@rollbar/react', () => ({ useRollbar: () => mockUseRollbar() }));
jest.mock('firebase/auth', () => ({
  onIdTokenChanged: (...args: unknown[]) => mockOnIdTokenChanged(...args),
}));
jest.mock('@/lib/utils/logEvent', () => jest.fn());
jest.mock('@/lib/constants/events', () => ({
  CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT',
  CHAT_MESSAGE_COMPOSED: 'CHAT_MESSAGE_COMPOSED',
}));

interface StubSocket {
  on: jest.Mock;
  emit: jest.Mock;
  timeout: jest.Mock;
  disconnect: jest.Mock;
  connected: boolean;
  handlers: Record<string, (arg?: unknown) => void>;
}

let lastSocket: StubSocket;
const mockIo = jest.fn();
jest.mock('socket.io-client', () => ({
  io: (...args: unknown[]) => {
    mockIo(...args);
    const handlers: StubSocket['handlers'] = {};
    const socket: StubSocket = {
      on: jest.fn((event: string, cb: (arg?: unknown) => void) => {
        handlers[event] = cb;
      }),
      emit: jest.fn(),
      timeout: jest.fn(),
      disconnect: jest.fn(),
      connected: false,
      handlers,
    };
    socket.timeout = jest.fn().mockReturnValue(socket);
    lastSocket = socket;
    return socket;
  },
}));

const triggerTokenChange = (firebaseUser: { uid: string } | null) => {
  const callback = mockOnIdTokenChanged.mock.calls[0]?.[1];
  if (callback) callback(firebaseUser);
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:35001/api/v1';
  mockGetAuthToken.mockResolvedValue({ token: 'firebase-token', error: null });
  mockOnIdTokenChanged.mockReturnValue(() => {});
});

describe('useFrontChat', () => {
  it('starts in idle state and only connects after a Firebase token is available', async () => {
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    expect(result.current.connectionState).toBe('idle');
    expect(mockIo).not.toHaveBeenCalled();

    await act(async () => {
      triggerTokenChange({ uid: 'fb-uid' });
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    // Function-form auth: socket.io invokes it on each (re)connect to fetch a
    // fresh Firebase token. Verify it resolves to the mocked token.
    const ioCall = mockIo.mock.calls[0];
    expect(ioCall[0]).toBe('http://localhost:35001/front-chat');
    const authFn = ioCall[1].auth as (cb: (arg: { token: string }) => void) => Promise<void>;
    expect(typeof authFn).toBe('function');
    const resolved = await new Promise<{ token: string }>((resolve) => {
      authFn((arg) => resolve(arg));
    });
    expect(resolved).toEqual({ token: 'firebase-token' });
  });

  it('moves to connected on the connect event and renders agent_reply messages', async () => {
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      triggerTokenChange({ uid: 'fb-uid' });
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    act(() => {
      lastSocket.handlers['connect']?.();
    });
    expect(result.current.connectionState).toBe('connected');

    act(() => {
      lastSocket.handlers['agent_reply']?.({
        body: 'Hi from agent',
        authorName: 'Alex',
        emittedAt: 1700000000,
      });
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(result.current.messages[0]).toEqual(
      expect.objectContaining({
        direction: 'agent',
        text: 'Hi from agent',
        authorName: 'Alex',
        status: 'sent',
      }),
    );
  });

  it('marks the optimistic message failed when no socket is connected', async () => {
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      await result.current.sendText('hello');
    });

    expect(result.current.messages.at(-1)?.status).toBe('failed');
  });

  it('disconnects and returns to idle when Firebase reports sign-out', async () => {
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      triggerTokenChange({ uid: 'fb-uid' });
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalled());
    const firstSocket = lastSocket;

    await act(async () => {
      triggerTokenChange(null);
    });

    expect(firstSocket.disconnect).toHaveBeenCalled();
    expect(result.current.connectionState).toBe('idle');
  });

  it('rejects oversize attachment uploads without calling fetch', async () => {
    const fetchSpy = jest.fn();
    (global as any).fetch = fetchSpy;
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    const oversize = new Blob([new Uint8Array(26 * 1024 * 1024)], { type: 'image/png' });

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.sendAttachment(oversize, 'image', 'Image');
      } catch (err) {
        thrown = err;
      }
    });

    expect((thrown as Error).message).toBe('FILE_TOO_LARGE');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('markAsRead calls PATCH /front-chat/read with the auth token', async () => {
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchSpy;
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      await result.current.markAsRead();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:35001/api/v1/front-chat/read',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer firebase-token' }),
      }),
    );
  });

  it('markAsRead does not throw when the request fails', async () => {
    const fetchSpy = jest.fn().mockRejectedValue(new Error('network error'));
    (global as any).fetch = fetchSpy;
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await expect(
      act(async () => {
        await result.current.markAsRead();
      }),
    ).resolves.not.toThrow();
  });

  it('calls markAsRead when an agent_reply arrives while the widget is open', async () => {
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchSpy;
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      triggerTokenChange({ uid: 'fb-uid' });
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    act(() => {
      lastSocket.handlers['connect']?.();
    });

    act(() => {
      lastSocket.handlers['agent_reply']?.({
        id: 'msg_agent_1',
        body: 'Hello from agent',
        emittedAt: 1700000000,
      });
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:35001/api/v1/front-chat/read',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('suppresses duplicate agent_reply events with the same id', async () => {
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      triggerTokenChange({ uid: 'fb-uid' });
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    act(() => {
      lastSocket.handlers['connect']?.();
    });

    act(() => {
      lastSocket.handlers['agent_reply']?.({
        id: 'msg_dup_1',
        body: 'Hello',
        emittedAt: 1700000000,
      });
    });
    act(() => {
      lastSocket.handlers['agent_reply']?.({
        id: 'msg_dup_1',
        body: 'Hello',
        emittedAt: 1700000000,
      });
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(result.current.messages[0].id).toBe('msg_dup_1');
  });

  it('merges history messages emitted via the history socket event', async () => {
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      triggerTokenChange({ uid: 'fb-uid' });
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    act(() => {
      lastSocket.handlers['history']?.({
        messages: [
          {
            id: 'hist_1',
            direction: 'user',
            text: 'Old message',
            createdAt: 1699000000000,
          },
          {
            id: 'hist_2',
            direction: 'agent',
            text: 'Old reply',
            createdAt: 1699000001000,
          },
        ],
      });
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    expect(result.current.messages.map((m: { id: string }) => m.id)).toEqual(['hist_1', 'hist_2']);
  });

  it('sets error state on connect_error', async () => {
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    await act(async () => {
      triggerTokenChange({ uid: 'fb-uid' });
    });
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    act(() => {
      lastSocket.handlers['connect_error']?.({ message: 'connection refused' });
    });

    expect(result.current.connectionState).toBe('error');
  });

  it('sendAttachment happy path: adds optimistic message and marks it sent on upload success', async () => {
    const fetchSpy = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchSpy;
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    const file = new File(['audio data'], 'voice-note.webm', { type: 'audio/webm' });

    await act(async () => {
      await result.current.sendAttachment(file, 'voice', 'Voice note');
    });

    const msg = result.current.messages.at(-1);
    expect(msg?.direction).toBe('user');
    expect(msg?.kind).toBe('voice');
    expect(msg?.status).toBe('sent');
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:35001/api/v1/front-chat/attachments',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sendAttachment sets message to failed when auth token fetch fails', async () => {
    mockGetAuthToken.mockResolvedValueOnce({ token: null, error: 'unauthenticated' });
    const { useFrontChat } = require('./useFrontChat');
    const { result } = renderHook(() => useFrontChat());

    // Use a voice Blob (not an image File) to avoid URL.createObjectURL being called
    const blob = new Blob(['audio data'], { type: 'audio/webm' });

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.sendAttachment(blob, 'voice', 'Voice note');
      } catch (err) {
        thrown = err;
      }
    });

    expect((thrown as Error).message).toBe('AUTH_FAILED');
    const msg = result.current.messages.at(-1);
    expect(msg?.status).toBe('failed');
  });
});
