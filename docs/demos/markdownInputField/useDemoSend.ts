import { useCallback, useRef, useState } from 'react';

/**
 * 模拟一次"发送"流程：1s 延时后追加到 sentList；handleStop 通过 AbortController 中断。
 * 当 demo 内连续触发发送时，新 controller 会替换 ref，旧的 finally 不会清空 ref，避免误清。
 */
export const useDemoSend = () => {
  const [sentList, setSentList] = useState<string[]>([]);
  const sendAbortRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(async (value: string) => {
    sendAbortRef.current?.abort();
    const controller = new AbortController();
    sendAbortRef.current = controller;
    try {
      await new Promise<void>((resolve, reject) => {
        // Node SSR 环境无 window：setTimeout/clearTimeout 全局等价可用
        const timer = setTimeout(resolve, 1000);
        controller.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
      setSentList((prev) => [...prev, value]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      throw err;
    } finally {
      if (sendAbortRef.current === controller) {
        sendAbortRef.current = null;
      }
    }
  }, []);

  const handleStop = useCallback(() => {
    sendAbortRef.current?.abort();
  }, []);

  return { sentList, handleSend, handleStop };
};
