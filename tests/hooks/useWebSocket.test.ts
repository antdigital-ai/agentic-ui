import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useWebSocket,
  WS_READY_STATE,
} from '../../src/Hooks/useWebSocket';

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  protocols?: string | string[];
  readyState: number = WS_READY_STATE.CONNECTING;

  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  send = vi.fn();
  close = vi.fn().mockImplementation(() => {
    this.readyState = WS_READY_STATE.CLOSED;
  });

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    MockWebSocket.instances.push(this);
  }

  simulateOpen() {
    this.readyState = WS_READY_STATE.OPEN;
    this.onopen?.(new Event('open'));
  }

  simulateMessage(data: unknown) {
    const event = new MessageEvent('message', { data });
    this.onmessage?.(event);
  }

  simulateClose(code = 1000, reason = '') {
    this.readyState = WS_READY_STATE.CLOSED;
    const event = new CloseEvent('close', { code, reason });
    this.onclose?.(event);
  }

  simulateError() {
    this.onerror?.(new Event('error'));
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('useWebSocket', () => {
  describe('基础连接', () => {
    it('autoConnect=true 时挂载即连接', () => {
      renderHook(() => useWebSocket('wss://example.com/ws'));
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(MockWebSocket.instances[0].url).toBe('wss://example.com/ws');
    });

    it('autoConnect=false 时不自动连接', () => {
      renderHook(() =>
        useWebSocket('wss://example.com/ws', { autoConnect: false }),
      );
      expect(MockWebSocket.instances).toHaveLength(0);
    });

    it('连接成功后 readyState 变为 OPEN', () => {
      const { result } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
      });

      expect(result.current.readyState).toBe(WS_READY_STATE.OPEN);
    });

    it('连接关闭后 readyState 变为 CLOSED', () => {
      const { result } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
      });
      act(() => {
        MockWebSocket.instances[0].simulateClose();
      });

      expect(result.current.readyState).toBe(WS_READY_STATE.CLOSED);
    });

    it('组件卸载时关闭连接', () => {
      const { unmount } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
      });

      unmount();

      expect(MockWebSocket.instances[0].close).toHaveBeenCalled();
    });
  });

  describe('消息收发', () => {
    it('收到消息后更新 latestMessage', () => {
      const { result } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
      });

      act(() => {
        MockWebSocket.instances[0].simulateMessage('hello');
      });

      expect(result.current.latestMessage?.data).toBe('hello');
    });

    it('连接 OPEN 时可以发送消息', () => {
      const { result } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
      });

      act(() => {
        result.current.sendMessage('test message');
      });

      expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith(
        'test message',
      );
    });

    it('连接未 OPEN 时不发送消息', () => {
      const { result } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      act(() => {
        result.current.sendMessage('test message');
      });

      expect(MockWebSocket.instances[0].send).not.toHaveBeenCalled();
    });
  });

  describe('回调函数', () => {
    it('onOpen 回调在连接建立时触发', () => {
      const onOpen = vi.fn();
      renderHook(() =>
        useWebSocket('wss://example.com/ws', { onOpen }),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
      });

      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('onMessage 回调在收到消息时触发', () => {
      const onMessage = vi.fn();
      renderHook(() =>
        useWebSocket('wss://example.com/ws', { onMessage }),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
        MockWebSocket.instances[0].simulateMessage('data');
      });

      expect(onMessage).toHaveBeenCalledTimes(1);
    });

    it('onClose 回调在连接关闭时触发', () => {
      const onClose = vi.fn();
      renderHook(() =>
        useWebSocket('wss://example.com/ws', { onClose }),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
        MockWebSocket.instances[0].simulateClose();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('onError 回调在连接错误时触发', () => {
      const onError = vi.fn();
      renderHook(() =>
        useWebSocket('wss://example.com/ws', { onError }),
      );

      act(() => {
        MockWebSocket.instances[0].simulateError();
      });

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('queryParams — URL token 传参（跨域鉴权推荐方案）', () => {
    it('将 queryParams 拼接到 URL', () => {
      renderHook(() =>
        useWebSocket('wss://example.com/ws', {
          queryParams: { token: 'abc123' },
        }),
      );

      expect(MockWebSocket.instances[0].url).toBe(
        'wss://example.com/ws?token=abc123',
      );
    });

    it('已有查询参数时用 & 拼接', () => {
      renderHook(() =>
        useWebSocket('wss://example.com/ws?foo=bar', {
          queryParams: { token: 'xyz' },
        }),
      );

      expect(MockWebSocket.instances[0].url).toBe(
        'wss://example.com/ws?foo=bar&token=xyz',
      );
    });

    it('多个 queryParams 都被拼接', () => {
      renderHook(() =>
        useWebSocket('wss://example.com/ws', {
          queryParams: { token: 'tok', userId: 'u1' },
        }),
      );

      const url = MockWebSocket.instances[0].url;
      expect(url).toContain('token=tok');
      expect(url).toContain('userId=u1');
    });

    it('没有 queryParams 时 URL 不变', () => {
      renderHook(() => useWebSocket('wss://example.com/ws'));
      expect(MockWebSocket.instances[0].url).toBe('wss://example.com/ws');
    });
  });

  describe('withCredentials — 跨域 cookie 携带', () => {
    it('withCredentials=true 时在开发模式下打印提示', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useWebSocket('wss://example.com/ws', { withCredentials: true }),
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('withCredentials=true'),
      );

      process.env.NODE_ENV = origEnv;
      consoleSpy.mockRestore();
    });

    it('withCredentials=true 依然正常建立 WebSocket 连接', () => {
      renderHook(() =>
        useWebSocket('wss://example.com/ws', { withCredentials: true }),
      );
      expect(MockWebSocket.instances).toHaveLength(1);
    });
  });

  describe('protocols', () => {
    it('传入 protocols 字符串时透传给 WebSocket', () => {
      renderHook(() =>
        useWebSocket('wss://example.com/ws', { protocols: 'chat' }),
      );

      expect(MockWebSocket.instances[0].protocols).toBe('chat');
    });

    it('传入 protocols 数组时透传给 WebSocket', () => {
      renderHook(() =>
        useWebSocket('wss://example.com/ws', {
          protocols: ['v1.chat', 'v2.chat'],
        }),
      );

      expect(MockWebSocket.instances[0].protocols).toEqual([
        'v1.chat',
        'v2.chat',
      ]);
    });
  });

  describe('手动 connect / disconnect', () => {
    it('disconnect 后可以手动 connect 重新建立连接', () => {
      const { result } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
      });

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.readyState).toBe(WS_READY_STATE.CLOSED);

      act(() => {
        result.current.connect();
      });

      expect(MockWebSocket.instances).toHaveLength(2);
    });
  });

  describe('断线重连', () => {
    it('reconnectLimit>0 时断线后自动重连', () => {
      vi.useFakeTimers();

      renderHook(() =>
        useWebSocket('wss://example.com/ws', {
          reconnectLimit: 2,
          reconnectInterval: 1000,
        }),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
        MockWebSocket.instances[0].simulateClose();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(MockWebSocket.instances).toHaveLength(2);
    });

    it('超过 reconnectLimit 后不再重连', () => {
      vi.useFakeTimers();

      renderHook(() =>
        useWebSocket('wss://example.com/ws', {
          reconnectLimit: 1,
          reconnectInterval: 500,
        }),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
        MockWebSocket.instances[0].simulateClose();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      act(() => {
        MockWebSocket.instances[1].simulateClose();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // 最多重连 1 次，所以总计 2 个实例
      expect(MockWebSocket.instances).toHaveLength(2);
    });

    it('reconnectLimit=0 时断线后不重连', () => {
      vi.useFakeTimers();

      renderHook(() =>
        useWebSocket('wss://example.com/ws', {
          reconnectLimit: 0,
          reconnectInterval: 1000,
        }),
      );

      act(() => {
        MockWebSocket.instances[0].simulateOpen();
        MockWebSocket.instances[0].simulateClose();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(MockWebSocket.instances).toHaveLength(1);
    });
  });

  describe('wsRef 暴露', () => {
    it('连接建立后 wsRef.current 指向 WebSocket 实例', () => {
      const { result } = renderHook(() =>
        useWebSocket('wss://example.com/ws'),
      );

      expect(result.current.wsRef.current).toBe(MockWebSocket.instances[0]);
    });
  });
});
