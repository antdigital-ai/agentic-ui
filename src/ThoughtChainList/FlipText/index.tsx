import classNames from 'clsx';
import React, { useEffect } from 'react';

/**
 * FlipText 字符翻转动画的隐藏/可见状态描述。
 *
 * 之前依赖 framer-motion 的 Variants 类型，此处替换为本地等价类型，
 * 仅保留默认 keyframes 实际使用的属性（rotateX / opacity）。
 *
 * 自定义值通过每个字符的 inline CSS 自定义属性注入，
 * 由 `@keyframes agenticFlipTextIn` 引用并真实生效。
 */
export interface FlipTextVariants {
  hidden?: { rotateX?: number; opacity?: number };
  visible?: { rotateX?: number; opacity?: number };
}

interface FlipTextProps {
  word: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: FlipTextVariants;
  className?: string;
}

/** 默认 hidden/visible 关键帧值，与历史 framer-motion 默认行为保持一致 */
const DEFAULT_HIDDEN_ROTATE_X = -90;
const DEFAULT_HIDDEN_OPACITY = 0;
const DEFAULT_VISIBLE_ROTATE_X = 0;
const DEFAULT_VISIBLE_OPACITY = 1;

/** 全局 keyframes 唯一注入标记 */
const FLIP_TEXT_STYLE_ID = 'agentic-ui-flip-text-keyframes';

/**
 * 一次性向 document.head 注入 FlipText 所需的 keyframes 与基础样式。
 *
 * 替代 framer-motion 的 motion.span + variants/transition 组合：
 * - `agenticFlipTextIn` 关键帧通过 CSS 自定义属性引用每个字符的 from/to 值，
 *   等价于 framer-motion 的 `variants.hidden` / `variants.visible`。
 * - 字符 stagger 通过每个 span 的 inline `animation-delay` 实现。
 *
 * 注入幂等，避免重复插入；SSR 安全（无 window 时跳过）。
 */
function ensureFlipTextStyleInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FLIP_TEXT_STYLE_ID)) return;
  const styleEl = document.createElement('style');
  styleEl.id = FLIP_TEXT_STYLE_ID;
  styleEl.textContent = `
@keyframes agenticFlipTextIn {
  from {
    transform: rotateX(var(--flip-from-rotate-x, ${DEFAULT_HIDDEN_ROTATE_X}deg));
    opacity: var(--flip-from-opacity, ${DEFAULT_HIDDEN_OPACITY});
  }
  to {
    transform: rotateX(var(--flip-to-rotate-x, ${DEFAULT_VISIBLE_ROTATE_X}deg));
    opacity: var(--flip-to-opacity, ${DEFAULT_VISIBLE_OPACITY});
  }
}
.agentic-flip-text-char {
  display: inline-block;
  transform-origin: center;
  animation-name: agenticFlipTextIn;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: both;
}
`;
  document.head.appendChild(styleEl);
}

/**
 * FlipText 组件 - 翻转文字动画组件
 *
 * 该组件为每个字符提供翻转动画效果，使用framer-motion实现流畅的动画。
 * 支持自定义动画参数、延迟时间、样式等配置。
 *
 * @component
 * @description 翻转文字动画组件，为文字提供字符级翻转动画
 * @param {FlipTextProps} props - 组件属性
 * @param {string} props.word - 要显示的文字
 * @param {number} [props.duration=0.5] - 每个字符的翻转动画持续时间
 * @param {number} [props.delayMultiple=0.08] - 字符间动画延迟倍数
 * @param {Variants} [props.framerProps] - framer-motion动画属性
 * @param {Object} [props.framerProps.hidden] - 隐藏状态动画
 * @param {number} [props.framerProps.hidden.rotateX=-90] - 初始X轴旋转角度
 * @param {number} [props.framerProps.hidden.opacity=0] - 初始透明度
 * @param {Object} [props.framerProps.visible] - 可见状态动画
 * @param {number} [props.framerProps.visible.rotateX=0] - 最终X轴旋转角度
 * @param {number} [props.framerProps.visible.opacity=1] - 最终透明度
 * @param {string} [props.className] - 额外的CSS类名
 *
 * @example
 * ```tsx
 * <FlipText
 *   word="Hello World"
 *   duration={0.6}
 *   delayMultiple={0.1}
 *   className="text-xl font-bold"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的翻转文字动画组件
 *
 * @remarks
 * - 为每个字符提供独立的翻转动画
 * - 支持自定义动画参数
 * - 提供字符间延迟效果
 * - 使用framer-motion实现流畅动画
 * - 支持自定义样式
 * - 在测试环境下简化显示
 * - 提供阴影效果
 * - 响应式布局
 */
export function FlipText({
  word,
  duration = 0.5,
  delayMultiple = 0.08,
  framerProps,
  className,
}: FlipTextProps) {
  // 首次渲染时注入全局 keyframes（幂等）。
  // 注意：必须在任何 early return 之前调用，确保 hooks 调用顺序稳定。
  useEffect(() => {
    ensureFlipTextStyleInjected();
  }, []);

  // 测试环境直接渲染纯文本，避免动画对快照/断言的干扰
  if (process.env.NODE_ENV === 'test') {
    return <div className="flex justify-center">{word}</div>;
  }

  // 将自定义 framerProps 解析为 CSS 自定义属性，注入到每个字符的 inline style；
  // keyframes 中通过 `var(--flip-from-rotate-x, default)` 引用，等价于
  // framer-motion 的 `variants.hidden` / `variants.visible` 行为。
  const fromRotateX = framerProps?.hidden?.rotateX ?? DEFAULT_HIDDEN_ROTATE_X;
  const fromOpacity = framerProps?.hidden?.opacity ?? DEFAULT_HIDDEN_OPACITY;
  const toRotateX = framerProps?.visible?.rotateX ?? DEFAULT_VISIBLE_ROTATE_X;
  const toOpacity = framerProps?.visible?.opacity ?? DEFAULT_VISIBLE_OPACITY;

  return (
    <div className="flex justify-center">
      {word.split('').map((char, i) => (
        <span
          key={i + '_' + char}
          className={classNames(
            'agentic-flip-text-char',
            'origin-center drop-shadow-sm',
            className,
          )}
          style={
            {
              animationDuration: `${duration}s`,
              animationDelay: `${i * delayMultiple}s`,
              '--flip-from-rotate-x': `${fromRotateX}deg`,
              '--flip-from-opacity': fromOpacity,
              '--flip-to-rotate-x': `${toRotateX}deg`,
              '--flip-to-opacity': toOpacity,
            } as React.CSSProperties
          }
        >
          {char}
        </span>
      ))}
    </div>
  );
}
