import React, { useEffect, useRef, useState } from 'react';
import { isTest } from '../Utils/env';

export interface BorderBeamAnimationProps {
  /** 是否显示动画 */
  isVisible: boolean;
  /** 圆角半径 */
  borderRadius: number;
  /** 动画完成回调 */
  onAnimationComplete?: () => void;
  /** 渐变 ID，用于避免多个实例冲突（已废弃，组件内部自动生成唯一 ID） */
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
 * - 使用纯 CSS（stroke-dasharray + stroke-dashoffset + @keyframes）实现路径动画
 * - 通过 SVG2 `pathLength="1"` 让 stroke-dash 系列属性使用 0-1 归一化值，
 *   等价于 framer-motion 的 pathLength / pathOffset 抽象
 * - 包含两条路径：模糊的尾部路径和明亮的核心路径
 * - 动画持续时间分别为 1s（尾）/ 0.8s（核心）
 * - 使用线性渐变实现彩色光束效果
 * - 路径计算在组件内部完成
 * - 使用 ResizeObserver 自动获取容器尺寸
 * - core path 动画结束时通过 onAnimationEnd 触发 onAnimationComplete 回调
 */

/** 唯一注入标记，避免重复插入全局 keyframes */
const BORDER_BEAM_STYLE_ID = 'agentic-ui-border-beam-keyframes';

/**
 * 一次性向 document.head 注入 BorderBeamAnimation 的 keyframes。
 *
 * 设计要点：
 * - 配合 SVG2 `pathLength="1"` 属性，dasharray/dashoffset 使用 0-1 归一化值，
 *   行为完全等价于 framer-motion 的 pathLength / pathOffset 0-1 区间值。
 * - tail（尾路径）：pathLength [0,0.45,0] + pathOffset [0,0.4] + opacity [0,0.4,0]，
 *   通过 stroke-dasharray "L 1" 控制可见长度 L、stroke-dashoffset 控制偏移。
 *   注意：dasharray "0.45 0.55" 表示 stroke 长度 0.45、空隙 0.55；
 *   dashoffset 为负向沿路径推进，因此 offset=0.4 → dashoffset=-0.4。
 * - core（核心路径）：pathLength [0,0.25,0] + pathOffset [0,0.65] + opacity [0,1,0]。
 * - times 控制中间帧位置：tail times=[0,0.5,1]、core times=[0,0.6,1]。
 *
 * SSR 安全（无 document 时跳过）；幂等。
 */
function ensureBorderBeamStyleInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(BORDER_BEAM_STYLE_ID)) return;
  const styleEl = document.createElement('style');
  styleEl.id = BORDER_BEAM_STYLE_ID;
  styleEl.textContent = `
@keyframes agenticBorderBeamTail {
  0% {
    stroke-dasharray: 0 1;
    stroke-dashoffset: 0;
    opacity: 0;
  }
  50% {
    stroke-dasharray: 0.45 0.55;
    stroke-dashoffset: -0.2;
    opacity: 0.4;
  }
  100% {
    stroke-dasharray: 0 1;
    stroke-dashoffset: -0.4;
    opacity: 0;
  }
}
@keyframes agenticBorderBeamCore {
  0% {
    stroke-dasharray: 0 1;
    stroke-dashoffset: 0;
    opacity: 0;
  }
  60% {
    stroke-dasharray: 0.25 0.75;
    stroke-dashoffset: -0.39;
    opacity: 1;
  }
  100% {
    stroke-dasharray: 0 1;
    stroke-dashoffset: -0.65;
    opacity: 0;
  }
}
.agentic-border-beam-tail,
.agentic-border-beam-core {
  animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  animation-fill-mode: both;
  animation-iteration-count: 1;
}
.agentic-border-beam-tail {
  animation-name: agenticBorderBeamTail;
  animation-duration: 1s;
}
.agentic-border-beam-core {
  animation-name: agenticBorderBeamCore;
  animation-duration: 0.8s;
}
`;
  document.head.appendChild(styleEl);
}
export const BorderBeamAnimation: React.FC<BorderBeamAnimationProps> = ({
  isVisible,
  borderRadius,
  onAnimationComplete,
  gradientId: gradientIdProp,
  offsetX = 1,
  offsetY = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 使用 React.useId 生成唯一渐变 ID，避免多实例冲突
  const generatedId = React.useId();
  const gradientId = gradientIdProp ?? `beam-gradient-${generatedId}`;

  // 使用 ResizeObserver 监听容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return;
    if (isTest()) return;

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

  // 首次渲染时注入全局 keyframes（幂等、SSR 安全）
  useEffect(() => {
    ensureBorderBeamStyleInjected();
  }, []);

  const { width, height } = dimensions;

  // 使用 props 传入的 borderRadius，而非硬编码
  const radius = borderRadius;
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
      {/* 替代 framer-motion AnimatePresence + motion.path 的描边动画：
          - 通过 SVG2 `pathLength="1"` 让 stroke-dasharray/stroke-dashoffset 使用 0-1 归一化值，
            与原 motion.path 的 pathLength/pathOffset 行为完全等价。
          - 关键帧定义在 style.ts 注入的全局样式里（参见 ensureBorderBeamStyleInjected）。
          - 原 AnimatePresence 仅保留入场（无 exit 动画），故直接条件渲染即可，行为一致。
          - core path 通过 onAnimationEnd 触发 onAnimationComplete，等价 framer-motion
            的 onAnimationComplete 回调时机。 */}
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
            <path
              className="agentic-border-beam-tail"
              d={pathData}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="4"
              strokeLinecap="round"
              filter="blur(8px)"
              pathLength={1}
            />
            {/* Core Path (Shorter, Sharp, Bright) */}
            <path
              className="agentic-border-beam-core"
              d={pathData}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="2"
              strokeLinecap="round"
              filter="blur(4px)"
              pathLength={1}
              onAnimationEnd={(e) => {
                // 仅响应自身动画结束，避免被子元素冒泡触发
                if (e.target === e.currentTarget) {
                  onAnimationComplete?.();
                }
              }}
            />
          </svg>
        </div>
      ) : null}
    </div>
  );
};
