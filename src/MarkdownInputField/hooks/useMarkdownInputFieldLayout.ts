import { useEffect, useRef, useState } from 'react';

/**
 * 布局管理 Hook
 * 管理组件布局相关的状态和逻辑
 */
export const useMarkdownInputFieldLayout = () => {
  const [collapseSendActions, setCollapseSendActions] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.innerWidth < 460) return true;
    return false;
  });

  const [rightPadding, setRightPadding] = useState(64);
  const [topRightPadding, setTopRightPadding] = useState(0);
  const [quickRightOffset, setQuickRightOffset] = useState(0);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    if (process.env.NODE_ENV === 'test') return;
    const handleResize = () => {
      if (!inputRef.current) return;
      if (process.env.NODE_ENV === 'test') return;
      if (inputRef.current?.clientWidth < 481) {
        setCollapseSendActions(true);
      } else {
        setCollapseSendActions(false);
      }
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(inputRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return {
    collapseSendActions,
    setCollapseSendActions,
    rightPadding,
    setRightPadding,
    topRightPadding,
    setTopRightPadding,
    quickRightOffset,
    setQuickRightOffset,
    inputRef,
  };
};
