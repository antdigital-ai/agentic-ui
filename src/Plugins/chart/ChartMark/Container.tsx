import { Chart } from 'chart.js';
import ResizeObserver from 'rc-resize-observer';
import React, { useEffect, useRef, useState } from 'react';
import { debounce } from '../utils';

export const Container: React.FC<{
  chartRef: React.MutableRefObject<Chart | undefined>;
  htmlRef: React.MutableRefObject<HTMLDivElement | null>;
  index: number;
  children?: React.ReactNode;
}> = (props) => {
  const { chartRef, htmlRef, children } = props;
  const sizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [inView, setInView] = useState(false);

  const onSize = debounce(
    () => {
      if (!inView) return;
      const chart = chartRef.current;
      if (!chart) return;
      const preSize = sizeRef.current;
      const containerWidth = htmlRef.current?.clientWidth || 0;

      // 让图表根据容器自然确定高度，保持最小高度
      const minHeight = 300;
      const naturalHeight = Math.max(containerWidth * 0.6, minHeight); // 宽高比约为 5:3

      const newSize = {
        width: containerWidth,
        height: naturalHeight,
      };

      // 增加阈值，减少频繁调整导致的抖动
      if (
        Math.abs(preSize.width - newSize.width) > 30 || // 从 20 增加到 30
        Math.abs(preSize.height - newSize.height) > 30 // 从 20 增加到 30
      ) {
        chart.resize(newSize.width, newSize.height);
        sizeRef.current = newSize;
        return;
      }
    },
    300 + props.index * 20, // 增加防抖延迟，从 160 增加到 300
  );

  useEffect(() => {
    if (inView) {
      onSize();
    }
    setInView(true);
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    if (!htmlRef.current) return;
    const containerWidth = htmlRef.current?.clientWidth || 0;
    const minHeight = 300;
    const naturalHeight = Math.max(containerWidth * 0.6, minHeight);

    const newSize = {
      width: containerWidth,
      height: naturalHeight,
    };
    sizeRef.current = newSize;
  }, [htmlRef.current]);

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return <div ref={htmlRef}>chart</div>;
  }

  // 计算容器高度，使用更自然的宽高比
  const containerWidth = htmlRef.current?.clientWidth || 400;
  const minHeight = 300;
  const containerHeight = Math.max(containerWidth * 0.6, minHeight);

  return (
    <ResizeObserver onResize={onSize}>
      <div
        ref={htmlRef}
        onClick={onSize}
        style={{
          height: `${containerHeight}px`,
          minHeight: `${minHeight}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </ResizeObserver>
  );
};
