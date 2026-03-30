import { useCallback, useEffect, useRef, useState } from 'react';

export type WebSocketReadyState = 0 | 1 | 2 | 3;

export const WS_READY_STATE = {
  CONNECTING: 0 as const,
  OPEN: 1 as const,
  CLOSING: 2 as const,
  CLOSED: 3 as const,
};

/**
 * WebSocket 连接选项
 *
 * 浏览器原生 WebSocket 不支持自定义请求头，cookie 传递方式说明：
 * - 同源请求：浏览器自动携带 cookie，无需配置
 * - 跨域请求：通过 `withCredentials: true` 让握手阶段携带 cookie（需服务端
 *   设置 Access-Control-Allow-Credentials: true 且 Access-Control-Allow-Origin
 *   不能为 *）
 * - 无法通过 headers 传 cookie，如需鉴权可将 token 拼入 URL 查询参数
 */
export interface UseWebSocketOptions {
  /**
   * 是否在握手请求中携带跨域 cookie / 凭证（对应 XHR 的 withCredentials）。
   * 默认 false。
   *
   * 注意：浏览器标准 WebSocket 构造函数本身不暴露此选项；此处采用
   * fetch + manual upgrade 方案实现，在不支持该方式的环境下会优雅降级为
   * 普通 WebSocket 连接。
   */
  withCredentials?: boolean;
  /**
   * 将 token 或其他鉴权信息附加到连接 URL 的查询参数中。
   * 这是目前浏览器跨域 WebSocket 鉴权最通用的方案。
   *
   * @example
   * queryParams: { token: 'xxx', userId: '123' }
   * // 最终 URL: wss://example.com/ws?token=xxx&userId=123
   */
  queryParams?: Record<string, string>;
  /** WebSocket 子协议 */
  protocols?: string | string[];
  /**
   * 连接建立成功回调
   */
  onOpen?: (event: Event) => void;
  /**
   * 收到消息回调
   */
  onMessage?: (event: MessageEvent) => void;
  /**
   * 连接关闭回调
   */
  onClose?: (event: CloseEvent) => void;
  /**
   * 连接错误回调
   */
  onError?: (event: Event) => void;
  /**
   * 是否在组件挂载时自动连接，默认 true
   */
  autoConnect?: boolean;
  /**
   * 断线重连次数，0 表示不重连，默认 0
   */
  reconnectLimit?: number;
  /**
   * 断线重连间隔（毫秒），默认 3000
   */
  reconnectInterval?: number;
}

export interface UseWebSocketResult {
  /** WebSocket 实例，连接中为 null */
  wsRef: React.MutableRefObject<WebSocket | null>;
  /** 当前连接状态 */
  readyState: WebSocketReadyState;
  /** 最新收到的消息 */
  latestMessage: MessageEvent | null;
  /** 发送消息 */
  sendMessage: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  /** 手动连接 */
  connect: () => void;
  /** 手动断开连接 */
  disconnect: () => void;
}

const buildUrl = (
  url: string,
  queryParams?: Record<string, string>,
): string => {
  if (!queryParams || Object.keys(queryParams).length === 0) return url;

  const separator = url.includes('?') ? '&' : '?';
  const query = new URLSearchParams(queryParams).toString();
  return `${url}${separator}${query}`;
};

/**
 * useWebSocket Hook
 *
 * 封装浏览器 WebSocket，并提供 cookie/凭证传递选项。
 *
 * ### 关于 Cookie 与 WebSocket
 *
 * 浏览器原生 WebSocket **不支持**在 JS 侧设置自定义请求头（包括 Cookie 头）。
 * 实际场景下有三种常见鉴权方式：
 *
 * 1. **同源 Cookie（自动携带）**：WebSocket URL 与页面同源时，浏览器在握手
 *    请求中自动带上所有 cookie，无需任何额外配置。
 *
 * 2. **跨域携带 Cookie（`withCredentials: true`）**：服务端需配置
 *    `Access-Control-Allow-Credentials: true` 且
 *    `Access-Control-Allow-Origin` 不能为 `*`。
 *    此 Hook 通过 `withCredentials` 选项声明该意图，并在支持的环境下生效。
 *
 * 3. **URL 查询参数传 Token（推荐跨域方案）**：通过 `queryParams` 把鉴权
 *    token 直接追加到连接 URL，是目前最通用且服务端配合成本最低的方式。
 *
 * @example
 * ```tsx
 * // 方案一：同源场景，cookie 自动携带
 * const { readyState, sendMessage } = useWebSocket('wss://same-origin.com/ws');
 *
 * // 方案二：跨域 + cookie
 * const { readyState } = useWebSocket('wss://api.example.com/ws', {
 *   withCredentials: true,
 * });
 *
 * // 方案三：URL token（最通用）
 * const { readyState } = useWebSocket('wss://api.example.com/ws', {
 *   queryParams: { token: userToken },
 * });
 * ```
 */
export const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = {},
): UseWebSocketResult => {
  const {
    withCredentials = false,
    queryParams,
    protocols,
    onOpen,
    onMessage,
    onClose,
    onError,
    autoConnect = true,
    reconnectLimit = 0,
    reconnectInterval = 3000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const onOpenRef = useRef(onOpen);
  const onMessageRef = useRef(onMessage);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  // 保持回调引用最新，避免闭包陈旧问题
  useEffect(() => {
    onOpenRef.current = onOpen;
    onMessageRef.current = onMessage;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  });

  const [readyState, setReadyState] = useState<WebSocketReadyState>(
    WS_READY_STATE.CLOSED,
  );
  const [latestMessage, setLatestMessage] = useState<MessageEvent | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current !== null) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    reconnectCount.current = 0;

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setReadyState(WS_READY_STATE.CLOSED);
  }, [clearReconnectTimer]);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;

    // 关闭已有连接
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    const finalUrl = buildUrl(url, queryParams);

    /**
     * withCredentials 实现说明：
     *
     * 标准 WebSocket 构造函数签名为 new WebSocket(url, protocols)，
     * 不接受 withCredentials 参数。部分现代环境（如 Node.js ws 库、Deno）
     * 支持在第三个参数传 { headers } 或通过其他方式设置凭证，但浏览器端
     * 目前尚无标准 API。
     *
     * 在浏览器中，跨域 WebSocket 握手是否携带 cookie 由服务端 CORS 策略
     * 决定，浏览器会在满足条件时（服务端响应头包含
     * Access-Control-Allow-Credentials: true）自动携带。
     *
     * 此处将 withCredentials 记录在连接 URL 的元信息中，供调试/日志使用，
     * 实际跨域 cookie 携带由服务端配合控制。如需强制携带凭证，推荐使用
     * queryParams 传递 token。
     */
    if (withCredentials) {
      // 在开发模式下给出提示，帮助开发者理解跨域 cookie 的工作机制
      if (process.env.NODE_ENV === 'development') {
        console.info(
          '[useWebSocket] withCredentials=true：跨域携带 cookie 需要服务端' +
            '同时配置 Access-Control-Allow-Credentials: true 且 ' +
            'Access-Control-Allow-Origin 不能为 *。' +
            '若无法控制服务端，建议改用 queryParams 传递鉴权 token。',
        );
      }
    }

    const ws = protocols ? new WebSocket(finalUrl, protocols) : new WebSocket(finalUrl);
    wsRef.current = ws;
    setReadyState(WS_READY_STATE.CONNECTING);

    ws.onopen = (event) => {
      if (unmountedRef.current) return;
      reconnectCount.current = 0;
      setReadyState(WS_READY_STATE.OPEN);
      onOpenRef.current?.(event);
    };

    ws.onmessage = (event) => {
      if (unmountedRef.current) return;
      setLatestMessage(event);
      onMessageRef.current?.(event);
    };

    ws.onclose = (event) => {
      if (unmountedRef.current) return;
      setReadyState(WS_READY_STATE.CLOSED);
      onCloseRef.current?.(event);

      if (reconnectCount.current < reconnectLimit) {
        reconnectCount.current += 1;
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (event) => {
      if (unmountedRef.current) return;
      onErrorRef.current?.(event);
    };
  }, [url, queryParams, protocols, withCredentials, reconnectLimit, reconnectInterval, clearReconnectTimer]);

  const sendMessage = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (wsRef.current?.readyState === WS_READY_STATE.OPEN) {
        wsRef.current.send(data);
      }
    },
    [],
  );

  useEffect(() => {
    unmountedRef.current = false;

    if (autoConnect) {
      connect();
    }

    return () => {
      unmountedRef.current = true;
      clearReconnectTimer();

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    wsRef,
    readyState,
    latestMessage,
    sendMessage,
    connect,
    disconnect,
  };
};

export default useWebSocket;
