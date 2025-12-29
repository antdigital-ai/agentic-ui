import { useCallback, useEffect, useRef } from 'react';

export function useThrottleFn(fn: any, interval = 100) {
  const fnRef = useRef(fn);
  const timeoutRef = useRef<any>(null);
  const lastArgsRef = useRef<any>(null);
  const lastThisRef = useRef<any>(null);
  const lastCallRef = useRef(0);

  fnRef.current = fn;

  const throttledFn = useCallback(
    function (this: any, ...args: any) {
      const now = Date.now();
      const remainingTime = interval - (now - lastCallRef.current);

      lastArgsRef.current = args;
      lastThisRef.current = this;

      if (remainingTime <= 0) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        lastCallRef.current = now;
        fnRef.current.apply(lastThisRef.current, lastArgsRef.current);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          timeoutRef.current = null;
          fnRef.current.apply(lastThisRef.current, lastArgsRef.current);
        }, remainingTime);
      }
    },
    [interval],
  );

  // 清理超时
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledFn;
}
