import { act, renderHook } from '@testing-library/react';
import { useVoiceRecorder } from './useVoiceRecorder';

class StubMediaRecorder {
  static instances: StubMediaRecorder[] = [];
  static lastInstance() {
    return StubMediaRecorder.instances[StubMediaRecorder.instances.length - 1];
  }
  static isTypeSupported: (type: string) => boolean = (type: string) =>
    type === 'audio/webm;codecs=opus' || type === 'audio/webm';

  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(
    public stream: MediaStream,
    public options: { mimeType: string },
  ) {
    StubMediaRecorder.instances.push(this);
  }

  get mimeType() {
    return this.options.mimeType;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['chunk'], { type: this.mimeType }) });
    this.onstop?.();
  }
}

const trackStop = jest.fn();
const stubStream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;

beforeEach(() => {
  trackStop.mockClear();
  StubMediaRecorder.instances = [];
  StubMediaRecorder.isTypeSupported = (type: string) =>
    type === 'audio/webm;codecs=opus' || type === 'audio/webm';
  (global as any).MediaRecorder = StubMediaRecorder;
  Object.defineProperty(global.navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: jest.fn().mockResolvedValue(stubStream) },
  });
});

describe('useVoiceRecorder', () => {
  it('reports supported when MediaRecorder + a known mime type are available', () => {
    const { result } = renderHook(() => useVoiceRecorder());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.state).toBe('idle');
  });

  it('transitions idle → recording → idle and resolves stop() with the captured blob', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('recording');

    let blob: Blob | undefined;
    await act(async () => {
      blob = await result.current.stop();
    });

    expect(result.current.state).toBe('idle');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob?.size).toBeGreaterThan(0);
    expect(trackStop).toHaveBeenCalled();
  });

  it('cancel() releases the mic stream without resolving stop()', async () => {
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.cancel();
    });

    expect(result.current.state).toBe('idle');
    expect(trackStop).toHaveBeenCalled();
  });

  it('throws UNSUPPORTED if no compatible mime type is available', async () => {
    StubMediaRecorder.isTypeSupported = () => false;
    const { result } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await expect(result.current.start()).rejects.toThrow('UNSUPPORTED');
    });
  });

  it('stops audio stream tracks when unmounted while recording', async () => {
    const { result, unmount } = renderHook(() => useVoiceRecorder());

    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('recording');

    act(() => {
      unmount();
    });

    expect(trackStop).toHaveBeenCalled();
  });
});
