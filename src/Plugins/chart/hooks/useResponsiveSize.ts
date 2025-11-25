import { useEffect, useMemo, useState } from 'react';

/**
 * 响应式尺寸 Hook
 *
 * 用于计算图表的响应式宽度和高度，并监听窗口大小变化。
 * 在移动端（宽度 <= 768px）时自动调整为全宽和自适应高度。
 *
 * @param {number | string} width - 图表宽度，默认600px
 * @param {number | string} height - 图表高度，默认400px
 * @returns {object} 包含响应式尺寸和移动端标识的对象
 *
 * @example
 * ```typescript
 * const { responsiveWidth, responsiveHeight, isMobile } = useResponsiveSize(800, 400);
 * ```
 *
 * @since 1.0.0
 */
export const useResponsiveSize = (
  width: number | string = 600,
  height: number | string = 400,
) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 768,
  );

  const isMobile = windowWidth <= 768;
  const responsiveWidth = isMobile ? '100%' : width;
  const responsiveHeight = isMobile
    ? Math.min(windowWidth * 0.8, 400)
    : height;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return useMemo(
    () => ({
      responsiveWidth,
      responsiveHeight,
      isMobile,
      windowWidth,
    }),
    [responsiveWidth, responsiveHeight, isMobile, windowWidth],
  );
};

