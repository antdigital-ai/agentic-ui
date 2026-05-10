import { useLayoutEffect, useState } from 'react';
import { shouldUseInformationalTooltipClickTrigger } from '../Utils/adaptiveTooltip';

/**
 * 与 Ant Design Tooltip 同用时，是否在触发器上保留原生 `title`。
 * 纯鼠标桌面环境为 false，避免与 Tooltip 叠出双重提示；触摸 / 移动为 true，作为无 hover 时的兜底。
 */
export function useNativeTitleTooltipFallback(): boolean {
  const [keep, setKeep] = useState(false);

  useLayoutEffect(() => {
    const update = () => {
      setKeep(shouldUseInformationalTooltipClickTrigger());
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return keep;
}
