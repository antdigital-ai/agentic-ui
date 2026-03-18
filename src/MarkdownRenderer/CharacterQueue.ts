import type { CharacterQueueOptions } from './types';

type TickMode = 'raf' | 'timeout';

const DEFAULT_CHARS_PER_FRAME = 3;
const DEFAULT_SPEED = 1.0;
const DEFAULT_BACKGROUND_INTERVAL = 100;
const DEFAULT_BACKGROUND_BATCH_MULTIPLIER = 10;

interface ResolvedOptions {
  charsPerFrame: number;
  animate: boolean;
  speed: number;
  flushOnComplete: boolean;
  backgroundInterval: number;
  backgroundBatchMultiplier: number;
}

/**
 * 字符队列——流式渲染的调度核心。
 *
 * - 接收 SSE 推送的 content（完整字符串，非增量）
 * - 标签页可见时以 RAF 驱动逐字输出（60fps 动画）
 * - 标签页不可见时降级为 setTimeout，保证后台仍能消费
 * - 切回前台时自动恢复 RAF
 */
export class CharacterQueue {
  private displayedLength = 0;
  private fullContent = '';
  private rafId: number | null = null;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private tickMode: TickMode = 'raf';
  private onFlush: (displayed: string) => void;
  private options: ResolvedOptions;
  private disposed = false;

  constructor(
    onFlush: (displayed: string) => void,
    options?: CharacterQueueOptions,
  ) {
    this.onFlush = onFlush;
    this.options = {
      charsPerFrame: options?.charsPerFrame ?? DEFAULT_CHARS_PER_FRAME,
      animate: options?.animate ?? true,
      speed: options?.speed ?? DEFAULT_SPEED,
      flushOnComplete: options?.flushOnComplete ?? true,
      backgroundInterval:
        options?.backgroundInterval ?? DEFAULT_BACKGROUND_INTERVAL,
      backgroundBatchMultiplier:
        options?.backgroundBatchMultiplier ??
        DEFAULT_BACKGROUND_BATCH_MULTIPLIER,
    };

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    }
  }

  /** SSE token 到达时调用——接收完整的 content 字符串 */
  push(content: string): void {
    this.fullContent = content;
    if (!this.options.animate) {
      this.displayedLength = content.length;
      this.onFlush(content);
      return;
    }
    this.ensureTicking();
  }

  /** 标记流式完成，flush 所有剩余内容 */
  complete(): void {
    if (this.options.flushOnComplete) {
      this.cancelAllTicks();
      this.displayedLength = this.fullContent.length;
      this.onFlush(this.fullContent);
    }
  }

  /** 释放资源 */
  dispose(): void {
    this.disposed = true;
    this.cancelAllTicks();
    if (typeof document !== 'undefined') {
      document.removeEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    }
  }

  /** 当前已展示的长度 */
  getDisplayedLength(): number {
    return this.displayedLength;
  }

  /** 完整内容 */
  getFullContent(): string {
    return this.fullContent;
  }

  // ---- 调度核心 ----

  private ensureTicking(): void {
    if (this.disposed || this.isTickActive()) return;

    const isVisible =
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible';
    this.tickMode = isVisible ? 'raf' : 'timeout';

    if (this.tickMode === 'raf') {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.timerId = setTimeout(this.tick, this.options.backgroundInterval);
    }
  }

  private tick = (): void => {
    this.rafId = null;
    this.timerId = null;

    if (this.disposed) return;

    const remaining = this.fullContent.length - this.displayedLength;
    if (remaining <= 0) return;

    const isVisible =
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible';
    const baseBatch = Math.max(
      1,
      Math.ceil(this.options.charsPerFrame * this.options.speed),
    );
    const batchSize = isVisible
      ? baseBatch
      : baseBatch * this.options.backgroundBatchMultiplier;

    this.displayedLength = Math.min(
      this.displayedLength + batchSize,
      this.fullContent.length,
    );
    this.onFlush(this.fullContent.slice(0, this.displayedLength));

    if (this.displayedLength < this.fullContent.length) {
      this.scheduleNext(isVisible);
    }
  };

  private scheduleNext(isVisible: boolean): void {
    if (isVisible) {
      this.tickMode = 'raf';
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.tickMode = 'timeout';
      this.timerId = setTimeout(this.tick, this.options.backgroundInterval);
    }
  }

  private handleVisibilityChange(): void {
    if (this.disposed) return;
    if (this.displayedLength >= this.fullContent.length) return;
    this.cancelAllTicks();
    this.ensureTicking();
  }

  private isTickActive(): boolean {
    return this.rafId !== null || this.timerId !== null;
  }

  private cancelAllTicks(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
