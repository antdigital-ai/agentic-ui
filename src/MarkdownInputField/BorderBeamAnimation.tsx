import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export interface BorderBeamAnimationProps {
  /** 是否显示动画 */
  isVisible: boolean;
  /** 圆角半径 */
  borderRadius: number;
  /** 动画完成回调 */
  onAnimationComplete?: () => void;
  /** 渐变 ID，用于避免多个实例冲突 */
  gradientId?: string;
  /** 水平偏移量 */
  offsetX?: number;
  /** 垂直偏移量 */
  offsetY?: number;
}

/**
 * BorderBeamAnimation 组件 - 边框光束动画
 *
 * 该组件提供一个沿边框移动的彩色光束动画效果，通常用于输入框获得焦点时的视觉反馈。
 *
 * @component
 * @description 边框光束动画组件，使用 SVG 和 Framer Motion 实现
 * @param {BorderBeamAnimationProps} props - 组件属性
 * @param {boolean} props.isVisible - 是否显示动画
 * @param {number} props.borderRadius - 圆角半径
 * @param {() => void} [props.onAnimationComplete] - 动画完成回调
 * @param {string} [props.gradientId] - 渐变 ID，用于避免多个实例冲突
 * @param {number} [props.offsetX] - 水平偏移量，默认为 6
 * @param {number} [props.offsetY] - 垂直偏移量，默认为 16
 *
 * @example
 * ```tsx
 * <BorderBeamAnimation
 *   isVisible={isFocused}
 *   borderRadius={16}
 *   onAnimationComplete={() => setAnimationComplete(true)}
 * />
 * ```
 *
 * @returns {React.ReactElement | null} 渲染的动画组件或 null
 *
 * @remarks
 * - 使用 Framer Motion 实现路径动画
 * - 包含两条路径：模糊的尾部路径和明亮的核心路径
 * - 动画持续时间为 1 秒
 * - 使用线性渐变实现彩色光束效果
 * - 路径计算在组件内部完成
 * - 使用 ResizeObserver 自动获取容器尺寸
 */
export const BorderBeamAnimation: React.FC<BorderBeamAnimationProps> = ({
  isVisible,
  borderRadius,
  onAnimationComplete,
  gradientId = 'beam-gradient',
  offsetX = 1,
  offsetY = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 使用 ResizeObserver 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;
    if (process.env.NODE_ENV === 'test') return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    setDimensions({
      width: containerRef.current?.clientWidth || 0,
      height: containerRef.current?.clientHeight || 0,
    });
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const { width, height } = dimensions;

  // Calculate SVG path based on dimensions
  const radius = 16;
  const w = width;
  const h = height;

  // Outer path dimensions
  const outerRadiusX = radius + offsetX;
  const outerRadiusY = radius + offsetY;

  // Ensure we have valid dimensions before generating path
  // Path starts from bottom-right corner to guide attention to top-left
  const pathData =
    w > 0 && h > 0
      ? `
    M ${w + offsetX - outerRadiusX} ${h + offsetY}
    H ${-offsetX + outerRadiusX}
    A ${outerRadiusX} ${outerRadiusY} 0 0 1 ${-offsetX} ${h + offsetY - outerRadiusY}
    V ${-offsetY + outerRadiusY}
    A ${outerRadiusX} ${outerRadiusY} 0 0 1 ${-offsetX + outerRadiusX} ${-offsetY}
    H ${w + offsetX - outerRadiusX}
    A ${outerRadiusX} ${outerRadiusY} 0 0 1 ${w + offsetX} ${-offsetY + outerRadiusY}
    V ${h + offsetY - outerRadiusY}
    A ${outerRadiusX} ${outerRadiusY} 0 0 1 ${w + offsetX - outerRadiusX} ${h + offsetY}
    Z
  `
          .replace(/\s+/g, ' ')
          .trim()
      : '';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99,
        borderRadius,
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {isVisible && pathData ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 0,
              borderRadius,
              overflow: 'visible',
            }}
          >
            <svg
              style={{
                width: '100%',
                height: '100%',
                overflow: 'visible',
              }}
              viewBox={`${-offsetX} ${-offsetY} ${w + offsetX * 2} ${h + offsetY * 2}`}
              fill="none"
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#5760FF" stopOpacity="1" />
                  <stop offset="15%" stopColor="#33CCFF" stopOpacity="1" />
                  <stop offset="30%" stopColor="#33CCFF" stopOpacity="1" />
                  <stop offset="50%" stopColor="#E2CCFF" stopOpacity="1" />
                  <stop offset="65%" stopColor="#33CCFF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#5760FF" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Tail Path (Longer, Blurry, Faint) */}
              <motion.path
                d={pathData}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="4"
                strokeLinecap="round"
                filter="blur(8px)"
                initial={{
                  pathLength: 0,
                  pathOffset: 0,
                  opacity: 0,
                }}
                animate={{
                  pathLength: [0, 0.45, 0],
                  pathOffset: [0, 0.4],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 1,
                  ease: 'easeInOut',
                  times: [0, 0.5, 1],
                }}
              />
              {/* Core Path (Shorter, Sharp, Bright) */}
              <motion.path
                d={pathData}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                filter="blur(4px)"
                initial={{
                  pathLength: 0,
                  pathOffset: 0,
                  opacity: 0,
                }}
                animate={{
                  pathLength: [0, 0.25, 0],
                  pathOffset: [0, 0.65],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeInOut',
                  times: [0, 0.6, 1],
                }}
                onAnimationComplete={onAnimationComplete}
              />
            </svg>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
