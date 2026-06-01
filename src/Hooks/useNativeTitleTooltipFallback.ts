import { useSyncExternalStore } from 'react';
import {
  getAdaptiveEnvironmentServerSnapshot,
  getAdaptiveEnvironmentSnapshot,
  subscribeAdaptiveTooltipEnvironment,
} from '../Utils/adaptiveTooltip';

/**
 * 与 Ant Design Tooltip 同用时，是否在触发器上保留原生 `title`。
 * 纯鼠标桌面环境为 false；触摸 / 移动为 true。与 `useAdaptiveTooltipProps` 共享环境订阅。
 */
export function useNativeTitleTooltipFallback(): boolean {
  return useSyncExternalStore(
    subscribeAdaptiveTooltipEnvironment,
    getAdaptiveEnvironmentSnapshot,
    getAdaptiveEnvironmentServerSnapshot,
  );
}
