import type { TooltipProps } from 'antd';
import { isMobileDevice } from './env';

export type AdaptiveTooltipKind = 'informational' | 'interactive';

function isTouchEnvironment(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return (
    'ontouchstart' in window ||
    (typeof navigator.maxTouchPoints === 'number' &&
      navigator.maxTouchPoints > 0)
  );
}

/**
 * 信息类 Tooltip 是否在触摸 / 窄屏移动场景下启用「点击展开」。
 * - `isMobileDevice()`：UA 或 触摸 + 小屏
 * - `isTouchEnvironment()`：存在触摸能力（含触屏笔记本）
 */
export function shouldUseInformationalTooltipClickTrigger(): boolean {
  if (typeof window === 'undefined') return false;
  return isMobileDevice() || isTouchEnvironment();
}

/**
 * 为 Ant Design Tooltip 生成自适应 `trigger`。
 * - `informational`：触摸或移动场景使用 `hover` + `click`，便于移动端查看说明；点击空白处由 rc-tooltip 关闭
 * - `interactive`：保持默认（仅 hover），避免与按钮/链接等主点击行为抢第一下触摸
 */
export function getAdaptiveTooltipProps(
  kind: AdaptiveTooltipKind = 'informational',
): Partial<Pick<TooltipProps, 'trigger'>> {
  if (typeof window === 'undefined') {
    return {};
  }
  if (kind === 'interactive') {
    return {};
  }
  if (shouldUseInformationalTooltipClickTrigger()) {
    return { trigger: ['hover', 'click'] };
  }
  return {};
}
