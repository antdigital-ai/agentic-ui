import { useCallback, useRef, useState } from 'react';

export const useDemoSend = () => {
  const [sentList, setSentList] = useState<string[]>([]);
  const sendAbortRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(async (value: string) => {
    sendAbortRef.current?.abort();
    const controller = new AbortController();
    sendAbortRef.current = controller;
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(resolve, 1000);
        controller.signal.addEventListener(
          'abort',
          () => {
            window.clearTimeout(timer);
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
