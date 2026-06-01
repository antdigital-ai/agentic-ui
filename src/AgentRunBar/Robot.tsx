/**
 * 与 `src/Components/Robot` 的关系说明：
 *
 * - `src/Components/Robot`（下文 `RobotIcon`）：通用机器人图标 SVG，关注于"画一只机器人"。
 *   只接收 `size` / `style` / `status` 等基础视觉参数，不感知任何业务态。
 *
 * - 本文件 `AgentRunBar/Robot`：在 `RobotIcon` 之上做"AgentRunBar 上下文"的二次封装：
 *   1. 接收业务侧状态（`thinking` / `dazing` / `pause` / `default`）并选择不同的渲染策略
 *      （是否镜像、是否使用更大尺寸的 RobotIcon、是否对齐到左上角图标槽位等）。
 *   2. 支持 `icon` 占位：当调用方传入 ReactElement 或图片 URL 时，跳过 `RobotIcon`，
 *      直接渲染调用方提供的图标。
 *   3. 通过 `THINKING_OFFSET` / `IDLE_OFFSET` 等 padding/margin 偏移，把不同 size 下
 *      `RobotIcon` 的视觉重心对齐到 `AgentRunBar` 的图标槽位。
 *
 * 这种"通用图标 + 业务包装"两层结构是为了让 `AgentRunBar` 拥有专属的状态动画与对齐逻辑，
 * 同时不污染通用的 `RobotIcon`。如果未来 `RobotIcon` 自身支持了状态化渲染，可以考虑下沉本文件。
 */
import classNames from 'clsx';
import { isString } from 'lodash-es';
import React from 'react';
import RobotIcon from '../Components/Robot';

type RobotStatus = 'default' | 'thinking' | 'dazing' | 'pause';

interface RobotProps {
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
 * thinking 状态下，对内层 RobotIcon 容器的视觉补偿留白。
 * 该 RobotIcon 渲染时其内部已有较大留白，外层 padding/margin 用于把图标
 * 视觉重心对齐到 AgentRunBar 左上角的图标槽位。
 */
const THINKING_OFFSET: React.CSSProperties = {
  paddingLeft: 80,
  marginRight: 50,
};

/**
 * 非 thinking 状态下（default / dazing / pause），对内层 RobotIcon 容器的视觉补偿留白。
 * 与 {@link THINKING_OFFSET} 同理，因 RobotIcon 在不同 size 下内部留白比例不同，
 * 用不同的偏移以保证视觉对齐。
 */
const IDLE_OFFSET: React.CSSProperties = {
  paddingLeft: 27,
  marginRight: 16,
};

/**
 * Robot 组件公共的 flex 居中样式。
 * 抽出为常量以便复用，避免内联对象在每次 render 重新创建。
 */
const BASE_WRAPPER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

/**
 * 自定义图标镜像样式。
 */
const MIRROR_ICON_STYLE: React.CSSProperties = {
  transform: 'rotateY(180deg)',
};

/**
 * 自定义图片填满容器的样式。
 */
const IMG_FILL_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

/**
 * Robot 组件 - 机器人图标组件
 *
 * 该组件显示一个机器人图标，支持自定义大小、状态和图标。
 * 主要用于任务运行状态显示，提供视觉反馈。
 *
 * @component
 * @description 机器人图标组件，支持自定义大小、状态和图标
 * @param {RobotProps} props - 组件属性
 * @param {RobotStatus} [props.status] - 机器人状态，可选值：'default' | 'thinking' | 'dazing'
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
 * <Robot size={50} status="thinking" />
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
  // 仅当未传入 React element 形式的自定义图标时，才需要外层 width/height 占位
  const wrapperStyle: React.CSSProperties = React.isValidElement(icon)
    ? { ...BASE_WRAPPER_STYLE, ...style }
    : { ...BASE_WRAPPER_STYLE, width: size, height: size, ...style };

  return (
    <div className={classNames(className)} style={wrapperStyle}>
      {React.isValidElement(icon) ? (
        icon
      ) : icon && isString(icon) ? (
        <img style={IMG_FILL_STYLE} src={icon as string} />
      ) : status === 'thinking' ? (
        <div style={THINKING_OFFSET}>
          <RobotIcon status="running" size={84} />
        </div>
      ) : (
        <div style={IDLE_OFFSET}>
          <RobotIcon size={54} style={MIRROR_ICON_STYLE} />
        </div>
      )}
    </div>
  );
};

export default React.memo(Robot);
