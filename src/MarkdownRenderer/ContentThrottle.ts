import type { ContentThrottleOptions } from './types';

const DEFAULT_CHARS_PER_FRAME = 3;
const DEFAULT_SPEED = 1;
const DEFAULT_BACKGROUND_INTERVAL_MS = 100;
const DEFAULT_BACKGROUND_BATCH_MULTIPLIER = 10;

interface ResolvedOptions {
  charsPerFrame: number;
  speed: number;
  flushOnComplete: boolean;
  backgroundInterval: number;
  backgroundBatchMultiplier: number;
}

/**
 * 将一次性到达的大段文本按帧顺序推进展示，避免整页突变重绘。
 * 不含视觉动画，仅控制「已展示字符数」相对完整 content 的追赶节奏。
 */
export class ContentThrottle {
  private displayedLength = 0;
  private fullContent = '';
  private rafId: number | null = null;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private readonly onFlush: (displayed: string) => void;
  private options: ResolvedOptions;
  private disposed = false;

  constructor(
    onFlush: (displayed: string) => void,
    options?: ContentThrottleOptions,
  ) {
    this.onFlush = onFlush;
    this.options = ContentThrottle.resolveOptions(options);

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    }
  }

  private static resolveOptions(
    options?: ContentThrottleOptions,
  ): ResolvedOptions {
    return {
      charsPerFrame: options?.charsPerFrame ?? DEFAULT_CHARS_PER_FRAME,
      speed: options?.speed ?? DEFAULT_SPEED,
      flushOnComplete: options?.flushOnComplete ?? true,
      backgroundInterval:
        options?.backgroundInterval ?? DEFAULT_BACKGROUND_INTERVAL_MS,
      backgroundBatchMultiplier:
        options?.backgroundBatchMultiplier ??
        DEFAULT_BACKGROUND_BATCH_MULTIPLIER,
    };
  }

  setOptions(options?: ContentThrottleOptions): void {
    this.options = ContentThrottle.resolveOptions(options);
    if (this.displayedLength < this.fullContent.length) {
      this.ensureTicking();
    }
  }

  /** 接收完整 content 字符串（非增量） */
  push(content: string): void {
    if (content === this.fullContent) {
      if (this.displayedLength < content.length) this.ensureTicking();
      return;
    }
    // O(1) 前缀探测：长度足够且边界字符匹配即视为前缀延伸；否则按 reset 处理。
    const stillPrefix =
      content.length >= this.displayedLength &&
      (this.displayedLength === 0 ||
        content.charCodeAt(this.displayedLength - 1) ===
          this.fullContent.charCodeAt(this.displayedLength - 1));
    if (!stillPrefix) {
      this.displayedLength = 0;
    }
    this.fullContent = content;
    if (this.displayedLength >= content.length) {
      this.onFlush(content);
      return;
    }
    this.ensureTicking();
  }

  /** 流式结束：立即展示剩余内容（已追上时为 no-op） */
  complete(): void {
    if (!this.options.flushOnComplete) return;
    if (this.displayedLength >= this.fullContent.length) return;
    this.cancelAllTicks();
    this.displayedLength = this.fullContent.length;
    this.onFlush(this.fullContent);
  }

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

  getDisplayedLength(): number {
    return this.displayedLength;
  }

  getFullContent(): string {
    return this.fullContent;
  }

  private ensureTicking(): void {
    if (this.disposed || this.rafId !== null || this.timerId !== null) return;
    this.schedule(ContentThrottle.isPageVisible());
  }

  private schedule(isVisible: boolean): void {
    const hasRaf = typeof requestAnimationFrame !== 'undefined';
    if (isVisible && hasRaf) {
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

    const isVisible = ContentThrottle.isPageVisible();
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
      this.schedule(isVisible);
    }
  };

  private handleVisibilityChange(): void {
    if (this.disposed) return;
    if (this.displayedLength >= this.fullContent.length) return;
    this.cancelAllTicks();
    this.ensureTicking();
  }

  private cancelAllTicks(): void {
    if (this.rafId !== null) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;
    }
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private static isPageVisible(): boolean {
    return (
      typeof document === 'undefined' || document.visibilityState === 'visible'
    );
  }
}
