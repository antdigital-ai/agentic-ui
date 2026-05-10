import type { TooltipProps } from 'antd';
import { isMobileDevice } from './env';

export type AdaptiveTooltipKind = 'informational' | 'interactive';

/** 无自适应 trigger 时的稳定引用，避免无谓重渲染 */
export const EMPTY_TOOLTIP_TRIGGER_PROPS: Partial<
  Pick<TooltipProps, 'trigger'>
> = Object.freeze({});

const HOVER_CLICK_TRIGGER = Object.freeze(['hover', 'click'] as const);

/** 信息类触摸/移动场景下的稳定 trigger 配置 */
export const INFORMATIONAL_TOOLTIP_TRIGGER_PROPS: Partial<
  Pick<TooltipProps, 'trigger'>
> = Object.freeze({
  trigger: HOVER_CLICK_TRIGGER as unknown as NonNullable<
    TooltipProps['trigger']
  >,
});

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
 * 环境判定单一入口：与导出函数、订阅快照共用同一引用，便于单测 `vi.spyOn`。
 */
export const adaptiveTooltipEnvironment = {
  isInformationalClickContext(): boolean {
    if (typeof window === 'undefined') return false;
    return isMobileDevice() || isTouchEnvironment();
  },
};

/**
 * 信息类 Tooltip 是否在触摸 / 窄屏移动场景下启用「点击展开」。
 * - `isMobileDevice()`：UA 或 触摸 + 小屏
 * - `isTouchEnvironment()`：存在触摸能力（含触屏笔记本）
 */
export function shouldUseInformationalTooltipClickTrigger(): boolean {
  return adaptiveTooltipEnvironment.isInformationalClickContext();
}

function readInformationalEnvironmentActive(): boolean {
  return adaptiveTooltipEnvironment.isInformationalClickContext();
}

// ── 共享订阅：全页至多一对 window 监听 ─────────────────────────────────────

const environmentListeners = new Set<() => void>();
let windowEventsAttached = false;
/** 上次因窗口事件广播过的值，用于省略无变化的 resize 回调 */
let lastBroadcastActive: boolean | null = null;

function syncInformationalEnvironmentFromWindow(): void {
  const next = readInformationalEnvironmentActive();
  if (lastBroadcastActive === next) return;
  lastBroadcastActive = next;
  environmentListeners.forEach((listener) => listener());
}

function attachWindowEventsIfNeeded(): void {
  if (typeof window === 'undefined' || windowEventsAttached) return;
  windowEventsAttached = true;
  window.addEventListener('resize', syncInformationalEnvironmentFromWindow);
  window.addEventListener(
    'orientationchange',
    syncInformationalEnvironmentFromWindow,
  );
}

function detachWindowEventsIfIdle(): void {
  if (typeof window === 'undefined' || !windowEventsAttached) return;
  window.removeEventListener('resize', syncInformationalEnvironmentFromWindow);
  window.removeEventListener(
    'orientationchange',
    syncInformationalEnvironmentFromWindow,
  );
  windowEventsAttached = false;
}

/**
 * 供 `useSyncExternalStore` 使用：所有消费者共享同一组 resize/orientation 监听。
 * 快照函数每次读取当前环境并返回稳定对象/布尔引用；窗口变化时仅广播订阅者，由 React 与 `Object.is` 自行跳过未变化的重渲染。
 */
export function subscribeAdaptiveTooltipEnvironment(
  onChange: () => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const wasEmpty = environmentListeners.size === 0;
  environmentListeners.add(onChange);

  if (wasEmpty) {
    attachWindowEventsIfNeeded();
  }

  return () => {
    environmentListeners.delete(onChange);
    if (environmentListeners.size === 0) {
      detachWindowEventsIfIdle();
      lastBroadcastActive = null;
    }
  };
}

/** 客户端快照：与原生 title 兜底共用，每次读取当前环境 */
export function getAdaptiveEnvironmentSnapshot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return readInformationalEnvironmentActive();
}

export function getAdaptiveEnvironmentServerSnapshot(): boolean {
  return false;
}

export function getAdaptiveTooltipTriggerPropsSnapshot(
  kind: AdaptiveTooltipKind,
): Partial<Pick<TooltipProps, 'trigger'>> {
  if (typeof window === 'undefined') {
    return EMPTY_TOOLTIP_TRIGGER_PROPS;
  }
  if (kind === 'interactive') {
    return EMPTY_TOOLTIP_TRIGGER_PROPS;
  }
  return readInformationalEnvironmentActive()
    ? INFORMATIONAL_TOOLTIP_TRIGGER_PROPS
    : EMPTY_TOOLTIP_TRIGGER_PROPS;
}

export function getAdaptiveTooltipTriggerPropsServerSnapshot(
  kind: AdaptiveTooltipKind,
): Partial<Pick<TooltipProps, 'trigger'>> {
  void kind;
  return EMPTY_TOOLTIP_TRIGGER_PROPS;
}

/**
 * 为 Ant Design Tooltip 生成自适应 `trigger`（每次读取当前环境，供非订阅场景 / 单测）。
 * - `informational`：触摸或移动场景使用 `hover` + `click`
 * - `interactive`：保持默认（仅 hover）
 */
export function getAdaptiveTooltipProps(
  kind: AdaptiveTooltipKind = 'informational',
): Partial<Pick<TooltipProps, 'trigger'>> {
  if (typeof window === 'undefined') {
    return EMPTY_TOOLTIP_TRIGGER_PROPS;
  }
  if (kind === 'interactive') {
    return EMPTY_TOOLTIP_TRIGGER_PROPS;
  }
  return shouldUseInformationalTooltipClickTrigger()
    ? INFORMATIONAL_TOOLTIP_TRIGGER_PROPS
    : EMPTY_TOOLTIP_TRIGGER_PROPS;
}
