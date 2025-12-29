import classNames from 'classnames';
import { isString } from 'lodash-es';
import React from 'react';
import { DazingLottie, ThinkingLottie } from './lotties';

export * from './lotties/BlowingWindLottie';
export * from './lotties/BouncingLottie';
export * from './lotties/PeekLottie';

export type RobotStatus = 'default' | 'running';

export interface RobotProps {
  /** 机器人状态 */
  status?: RobotStatus;
  /** 机器人大小 */
  size?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}

/**
 * Robot 组件 - 机器人图标组件
 *
 * 该组件显示一个机器人图标，支持自定义大小、状态和图标。
 * 主要用于任务运行状态显示，提供视觉反馈。
 *
 * @component
 * @description 机器人图标组件，支持自定义大小、状态和图标
 * @param {RobotProps} props - 组件属性
 * @param {RobotStatus} [props.status] - 机器人状态，可选值：'default' | 'running'
 * @param {number} [props.size=42] - 机器人图标大小（像素）
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {React.ReactNode} [props.icon] - 自定义图标，可以是React元素或图片URL
 *
 * @example
 * ```tsx
 * import { Robot } from './Robot';
 *
 * // 基本用法
 * <Robot size={50} status="running" />
 *
 * // 自定义图标
 * <Robot icon={<CustomIcon />} size={60} />
 *
 * // 使用图片URL
 * <Robot icon="https://example.com/robot.png" />
 * ```
 *
 * @returns {React.ReactElement} 渲染的机器人图标组件
 *
 * @remarks
 * - 当提供自定义图标时，会忽略默认的机器人图片
 * - 支持字符串类型的图片URL或React元素
 * - 组件使用 React.memo 进行性能优化
 */
const Robot: React.FC<RobotProps> = ({
  icon,
  size = 42,
  status,
  className,
  style,
}) => {
  return (
    <div
      className={classNames(className)}
      style={
        React.isValidElement(icon)
          ? {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              ...style,
            }
          : {
              width: size,
              height: size,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              ...style,
            }
      }
    >
      {React.isValidElement(icon) ? (
        icon
      ) : icon && isString(icon) ? (
        <img
          style={{
            width: '100%',
            height: '100%',
          }}
          src={icon as string}
        />
      ) : (
        <>
          {status === 'running' ? (
            <ThinkingLottie size={size} />
          ) : (
            <DazingLottie size={size} />
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(Robot);
