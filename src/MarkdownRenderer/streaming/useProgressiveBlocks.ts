import { useEffect, useState } from 'react';

/**
 * 非流式大文档分帧渐进渲染：首批只渲染前 N 个块，后续在空闲帧逐步追加。
 *
 * - 流式场景（streaming=true）不启用，直接返回全量
 * - 块数 ≤ 阈值时不启用，直接返回全量
 * - 标签页不可见时降级为一次性全量渲染（RAF/rIC 被冻结会导致内容缺失）
 * - 切回可见时如果尚未渲染完，继续分帧追加
 */

/** 首批渲染块数 */
const INITIAL_BATCH = 8;
/** 每帧追加块数 */
const BATCH_SIZE = 6;
/** 块数低于此值不启用分帧 */
const PROGRESSIVE_THRESHOLD = 12;

interface ProgressiveState {
  visibleCount: number;
  lastTotal: number;
  lastStreaming: boolean;
  lastGeneration: number | undefined;
}

const computeResetVisibleCount = (
  totalBlocks: number,
  streaming: boolean,
): number => {
  if (streaming || totalBlocks <= PROGRESSIVE_THRESHOLD) return totalBlocks;
  return Math.min(INITIAL_BATCH, totalBlocks);
};

/**
 * @param totalBlocks 总块数
 * @param streaming 是否处于流式模式
 * @param generation 内容生成代 —— 当文档被整体替换为等长内容时用于检测
 * @returns visibleCount —— 当前应渲染的块数（≤ totalBlocks）
 */
export function useProgressiveBlocks(
  totalBlocks: number,
  streaming: boolean,
  generation?: number,
): number {
  const [state, setState] = useState<ProgressiveState>(() => ({
    visibleCount: computeResetVisibleCount(totalBlocks, streaming),
    lastTotal: totalBlocks,
    lastStreaming: streaming,
    lastGeneration: generation,
  }));

  // 渲染期同步派生 visibleCount：用 setState-in-render 让 React 同帧重渲，
  // 否则等长替换会先按旧 visibleCount 全量渲染再坍缩到 INITIAL_BATCH，肉眼可见闪烁
  let visibleCount = state.visibleCount;
  const totalChanged = totalBlocks !== state.lastTotal;
  const streamingChanged = streaming !== state.lastStreaming;
  const generationChanged = generation !== state.lastGeneration;

  if (totalChanged || streamingChanged || generationChanged) {
    visibleCount = computeResetVisibleCount(totalBlocks, streaming);
    setState({
      visibleCount,
      lastTotal: totalBlocks,
      lastStreaming: streaming,
      lastGeneration: generation,
    });
  }

  useEffect(() => {
    if (streaming || state.visibleCount >= totalBlocks) return;

    if (typeof document !== 'undefined' && document.hidden) {
      setState((prev) => ({ ...prev, visibleCount: totalBlocks }));
      return;
    }

    let cancelled = false;

    const scheduleNext = () => {
      if (cancelled) return;
      const bump = () => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          visibleCount: Math.min(prev.visibleCount + BATCH_SIZE, totalBlocks),
        }));
      };
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(bump, { timeout: 80 });
      } else {
        requestAnimationFrame(bump);
      }
    };

    scheduleNext();

    const handleVisibility = () => {
      if (document.hidden) {
        cancelled = true;
        setState((prev) => ({ ...prev, visibleCount: totalBlocks }));
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      cancelled = true;
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [state.visibleCount, totalBlocks, streaming]);

  return visibleCount;
}
