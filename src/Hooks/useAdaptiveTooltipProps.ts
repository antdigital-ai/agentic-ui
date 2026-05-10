import type { TooltipProps } from 'antd';
import { useLayoutEffect, useState } from 'react';
import {
  type AdaptiveTooltipKind,
  getAdaptiveTooltipProps,
} from '../Utils/adaptiveTooltip';

/**
 * 客户端挂载后返回自适应 Tooltip 属性，避免 SSR 与首屏 hydration 不一致。
 * 监听 resize / orientationchange 以适配旋转与窗口缩放导致的 `isMobileDevice` 变化。
 */
export function useAdaptiveTooltipProps(
  kind: AdaptiveTooltipKind = 'informational',
): Partial<Pick<TooltipProps, 'trigger'>> {
  const [tooltipProps, setTooltipProps] = useState<
    Partial<Pick<TooltipProps, 'trigger'>>
  >({});

  useLayoutEffect(() => {
    const update = () => {
      setTooltipProps(getAdaptiveTooltipProps(kind));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [kind]);

  return tooltipProps;
}
