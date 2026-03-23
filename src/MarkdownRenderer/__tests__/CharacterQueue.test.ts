import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterQueue } from '../CharacterQueue';

describe('CharacterQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('应在非动画模式下立即 flush 全部内容', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, { animate: false });

    queue.push('Hello World');

    expect(onFlush).toHaveBeenCalledWith('Hello World');
    expect(onFlush).toHaveBeenCalledTimes(1);

    queue.dispose();
  });

  it('应在动画模式下逐步 flush 内容', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 3,
      speed: 1.0,
    });

    queue.push('Hello');

    // RAF 被 mock 成 setTimeout(16ms)
    vi.advanceTimersByTime(16);
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenLastCalledWith('Hel');

    vi.advanceTimersByTime(16);
    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenLastCalledWith('Hello');

    queue.dispose();
  });

  it('complete() 应立即 flush 所有剩余内容', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 1,
    });

    queue.push('Hello World');
    queue.complete();

    expect(onFlush).toHaveBeenLastCalledWith('Hello World');

    queue.dispose();
  });

  it('dispose() 应停止所有调度', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 1,
    });

    queue.push('Hello');
    queue.dispose();

    vi.advanceTimersByTime(1000);

    // dispose 后不应有额外的 flush
    expect(onFlush).toHaveBeenCalledTimes(0);
  });

  it('push 多次应只保留最新的 fullContent', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 5,
    });

    queue.push('Hello');
    queue.push('Hello World');

    vi.advanceTimersByTime(16);
    expect(onFlush).toHaveBeenLastCalledWith('Hello');

    vi.advanceTimersByTime(16);
    expect(onFlush).toHaveBeenLastCalledWith('Hello Worl');

    vi.advanceTimersByTime(16);
    expect(onFlush).toHaveBeenLastCalledWith('Hello World');

    queue.dispose();
  });

  it('应在标签页不可见时使用 setTimeout 调度', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
      configurable: true,
    });

    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 2,
      backgroundInterval: 100,
      backgroundBatchMultiplier: 5,
    });

    queue.push('Hello World!!');

    // 后台模式：charsPerFrame(2) * backgroundBatchMultiplier(5) = 10 chars per tick
    vi.advanceTimersByTime(100);
    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenLastCalledWith('Hello Worl');

    vi.advanceTimersByTime(100);
    expect(onFlush).toHaveBeenCalledTimes(2);
    expect(onFlush).toHaveBeenLastCalledWith('Hello World!!');

    queue.dispose();
  });

  it('getDisplayedLength 和 getFullContent 应返回正确值', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, { animate: false });

    queue.push('Hello');

    expect(queue.getFullContent()).toBe('Hello');
    expect(queue.getDisplayedLength()).toBe(5);

    queue.dispose();
  });

  it('speed 参数应影响每帧输出字符数', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 2,
      speed: 2.0,
    });

    queue.push('Hello World');

    // baseBatch = ceil(2 * 2.0) = 4
    vi.advanceTimersByTime(16);
    expect(onFlush).toHaveBeenLastCalledWith('Hell');

    queue.dispose();
  });

  it('flushOnComplete 为 false 时 complete 不应强制 flush', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 1,
      flushOnComplete: false,
    });

    queue.push('Hello');
    queue.complete();

    // complete 不应立即 flush
    expect(onFlush).toHaveBeenCalledTimes(0);

    queue.dispose();
  });

  it('animateTailChars 为 50 时仅对末尾 50 字做动画', () => {
    const onFlush = vi.fn();
    const queue = new CharacterQueue(onFlush, {
      animate: true,
      charsPerFrame: 10,
      animateTailChars: 50,
    });

    // 100 字内容：前 50 立即展示，后 50 逐字动画
    const head = 'a'.repeat(50);
    const tail = 'b'.repeat(50);
    queue.push(head + tail);

    // push 时立即 flush 前 50 字
    expect(onFlush).toHaveBeenCalledWith(head);
    expect(onFlush).toHaveBeenCalledTimes(1);

    // 第一帧：50 + 10 = 60
    vi.advanceTimersByTime(16);
    expect(onFlush).toHaveBeenLastCalledWith(head + tail.slice(0, 10));

    // 后续帧直至完成
    vi.advanceTimersByTime(16 * 4);
    expect(onFlush).toHaveBeenLastCalledWith(head + tail);

    queue.dispose();
  });
});
