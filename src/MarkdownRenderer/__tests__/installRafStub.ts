import { vi } from 'vitest';

/**
 * jsdom 不提供 requestAnimationFrame；以 16ms setTimeout 模拟，
 * 让 vi.advanceTimersByTimeAsync 能稳定推进 ContentThrottle / streaming 的帧节奏。
 */
export const installRafStub = () => {
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  let nextId = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = ++nextId;
    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        cb(performance.now());
      }, 16),
    );
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    const timerId = timers.get(id);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timers.delete(id);
    }
  });
};
