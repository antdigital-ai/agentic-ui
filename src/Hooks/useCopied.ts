import { useEffect, useMemo, useState } from 'react';
import { useRefFunction } from './useRefFunction';

/**
 * "已复制"状态自动复位的持续时间（ms）
 */
const COPIED_RESET_MS = 1000;

/**
 * useCopied Hook - "已复制"状态管理
 *
 * 维护一个短暂的 `copied` 布尔，调用 `setCopied()` 后置为 true，
 * `COPIED_RESET_MS` 毫秒后自动复位 false，常用于复制按钮的「已复制」反馈动画。
 *
 * @returns
 * - `copied`：当前是否处于"已复制"状态
 * - `setCopied`：触发"已复制"状态（命名沿用历史 API；语义是 trigger 而非 setter）
 * - `reset`：主动立即复位为 false（如用户提前点其他按钮、组件状态切换等场景）
 *
 * @example
 * ```tsx
 * const { copied, setCopied, reset } = useCopied();
 * const handleCopy = async () => {
 *   await navigator.clipboard.writeText(text);
 *   setCopied();
 * };
 * ```
 */
export const useCopied = () => {
  const [copied, setCopy] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopy(false);
    }, COPIED_RESET_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  /**
   * 触发"已复制"状态：置 copied 为 true，{@link COPIED_RESET_MS} 后自动复位。
   * 命名上沿用历史 API（`setCopied`），但语义是「trigger」而非通用 setter，
   * 不接受参数；如需主动复位请使用 `reset`。
   */
  const setCopied = useRefFunction(() => setCopy(true));

  /**
   * 主动立即复位为 false，跳过自动定时器
   */
  const reset = useRefFunction(() => setCopy(false));

  return useMemo(
    () => ({ copied, setCopied, reset }),
    [copied, setCopied, reset],
  );
};
