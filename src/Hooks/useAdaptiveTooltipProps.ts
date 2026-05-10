import type { TooltipProps } from 'antd';
import { useSyncExternalStore } from 'react';
import {
  type AdaptiveTooltipKind,
  getAdaptiveTooltipTriggerPropsServerSnapshot,
  getAdaptiveTooltipTriggerPropsSnapshot,
  subscribeAdaptiveTooltipEnvironment,
} from '../Utils/adaptiveTooltip';

/**
 * 客户端挂载后返回自适应 Tooltip 属性，与 `useSyncExternalStore` 对齐 SSR。
 * 环境变化通过共享的 resize/orientationchange 订阅广播，避免每实例重复监听。
 */
export function useAdaptiveTooltipProps(
  kind: AdaptiveTooltipKind = 'informational',
): Partial<Pick<TooltipProps, 'trigger'>> {
  return useSyncExternalStore(
    subscribeAdaptiveTooltipEnvironment,
    () => getAdaptiveTooltipTriggerPropsSnapshot(kind),
    () => getAdaptiveTooltipTriggerPropsServerSnapshot(kind),
  );
}
