import classNames from 'clsx';
import { motion, Variants } from 'framer-motion';
import React from 'react';

interface FlipTextProps {
  word: string;
  duration?: number;
  delayMultiple?: number;
  framerProps?: Variants;
  className?: string;
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
  framerProps = {
    hidden: { rotateX: -90, opacity: 0 },
    visible: { rotateX: 0, opacity: 1 },
  },
  className,
}: FlipTextProps) {
  if (process.env.NODE_ENV === 'test') {
    return <div className="flex justify-center">{word}</div>;
  }
  return (
    <div className="flex justify-center">
      {word.split('').map((char, i) => (
        <motion.span
          key={i + '_' + char}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={framerProps}
          transition={{ duration, delay: i * delayMultiple }}
          className={classNames('origin-center drop-shadow-sm', className)}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}
