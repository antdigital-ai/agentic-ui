import { useCallback, useEffect, useRef, useState } from 'react';
import getScroll from '../../utils/getScroll';
import throttleByAnimationFrame from '../../utils/throttleByAnimationFrame';

export type UseScrollVisibleProps = {
  /**
   * 滚动到顶部/底部的目标元素
   * @default () => window
   */
  target: () => HTMLElement | Window;
  /**
   * 是否显示
   */
  shouldVisible: (scrollTop: number, target: HTMLElement | Window) => boolean;
};

export const useScrollVisible = ({
  target,
  shouldVisible,
}: UseScrollVisibleProps) => {
  const [visible, setVisible] = useState(false);

  const getShouldVisible = useCallback(
    (scrollTop: number) => {
      const container = target();
      return shouldVisible(scrollTop, container);
    },
    [target, shouldVisible],
  );

  const handleScroll = throttleByAnimationFrame(
    (e: React.UIEvent<HTMLElement, UIEvent> | { target: any }) => {
      const scrollTop = getScroll(e.target);
      setVisible(getShouldVisible(scrollTop));
    },
  );

  const currentContainer = useRef<HTMLElement | Window>(window);

  useEffect(() => {
    const container = target();
    handleScroll({ target: container });
    currentContainer.current = container;
    container?.addEventListener('scroll', handleScroll);
    return () => {
      handleScroll.cancel();
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [target, getShouldVisible]);

  return { visible, currentContainer };
};
