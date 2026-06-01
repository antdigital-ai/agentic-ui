import React from 'react';

/**
 * 模块级自增计数器，给每个 HistoryRunningIcon 实例分配稳定且唯一的 id。
 *
 * 之前用 `Math.random().toString(36).substr(2,9)`：
 * 1. SSR 与 client 两次随机不一致 → React hydration 警告
 * 2. 极小概率 id 撞车导致 keyframes / clipPath / linearGradient 互相污染
 * 3. `String.prototype.substr` 是已废弃 API
 *
 * 计数器从模块加载开始单调递增，SSR 与 client 行为一致；
 * 仓库 peerDeps 是 React >=16.9.0，无法直接用 React 18 的 `useId`，
 * 所以选择稳定 counter 而非 `useId`。
 */
let runningIconCounter = 0;

/**
 * 全局只注入一次的 keyframes 标记，避免每个实例都往 DOM 写一份 `<style>`。
 * key 用 `keyframes` 名字本身做缓存，做到「同名只注入一次」。
 */
const injectedKeyframes = new Set<string>();

/** 把 keyframes 注入到 document.head（仅浏览器、仅一次） */
const ensureKeyframesInjected = (animationName: string): void => {
  if (typeof document === 'undefined') return;
  if (injectedKeyframes.has(animationName)) return;
  injectedKeyframes.add(animationName);
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-history-running-icon', animationName);
  styleEl.textContent = `@keyframes ${animationName} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleEl);
};

/**
 * 运行图标组件的属性接口
 */
export interface HistoryRunningIconProps extends React.SVGProps<SVGSVGElement> {
  /** 是否启用旋转动画 */
  animated?: boolean;
  /** 动画持续时间（秒） */
  duration?: number;
  /** 是否暂停动画 */
  paused?: boolean;
  /** 自定义动画样式 */
  animationStyle?: React.CSSProperties;
}

/**
 * 运行图标组件
 *
 * 一个带有渐变色彩和可选旋转动画的运行状态图标
 *
 * @param props 组件属性
 * @param props.animated 是否启用旋转动画，默认为 true
 * @param props.duration 动画持续时间（秒），默认为 2
 * @param props.paused 是否暂停动画，默认为 false
 * @param props.animationStyle 自定义动画样式
 * @param props.style 自定义样式
 * @param props.className 自定义类名
 * @param props... 其他 SVG 属性
 *
 * @returns 运行图标组件
 *
 * @example
 * ```tsx
 * // 基础用法
 * <HistoryRunningIcon />
 *
 * // 自定义大小和动画
 * <HistoryRunningIcon
 *   width={24}
 *   height={24}
 *   animated={true}
 *   duration={1.5}
 * />
 *
 * // 暂停动画
 * <HistoryRunningIcon animated={false} />
 *
 * // 自定义样式
 * <HistoryRunningIcon
 *   style={{ color: 'red' }}
 *   animationStyle={{ animationTimingFunction: 'ease-in-out' }}
 * />
 * ```
 */
export const HistoryRunningIcon: React.FC<HistoryRunningIconProps> = React.memo(
  ({
    animated = true,
    duration = 2,
    paused = false,
    animationStyle,
    style,
    className,
    ...svgProps
  }) => {
    // 用模块级 counter 生成稳定 id，SSR 与 client 一致；不再使用 Math.random
    const animationId = React.useMemo(() => {
      runningIconCounter += 1;
      return `history-running-${runningIconCounter}`;
    }, []);

    // 仅在启用动画时往 head 注入一次 keyframes（同名只注入一次）
    if (animated) {
      ensureKeyframesInjected(animationId);
    }

    // 合并样式
    const mergedStyle: React.CSSProperties = {
      ...style,
      ...(animated && {
        animation: paused
          ? 'none'
          : `${animationId} ${duration}s linear infinite`,
        ...animationStyle,
      }),
    };

    return (
      <>
        {/* SVG图标 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          width="1em"
          height="1em"
          viewBox="0 0 16 16"
          style={mergedStyle}
          className={className}
          {...svgProps}
        >
          <defs>
            <clipPath id={`${animationId}-clip`}>
              <rect width={16} height={16} rx={0} />
            </clipPath>
            <linearGradient
              x1={-0.17775046825408936}
              y1={1}
              x2={0.8258928656578064}
              y2={-0.11863356828689575}
              id={`${animationId}-gradient`}
            >
              <stop offset="21.42857164144516%" stopColor="#D7B9FF" />
              <stop offset="62.14284896850586%" stopColor="#9BA0FF" />
              <stop offset="100%" stopColor="#09B1FF" />
            </linearGradient>
          </defs>
          <g clipPath={`url(#${animationId}-clip)`}>
            <path
              d="M5.671 4.729L3.738 2.795a.667.667 0 10-.943.943L4.73 5.671a.667.667 0 00.942-.942zM1.333 7.333H4a.667.667 0 110 1.334H1.333a.667.667 0 010-1.334zM5.867 10.8c0 .177-.07.346-.196.471l-1.933 1.933a.667.667 0 11-.943-.942l1.933-1.933a.667.667 0 011.139.471zM7.333 12a.667.667 0 111.334 0v2.667a.667.667 0 11-1.334 0V12zm5.872.262l-1.934-1.933a.667.667 0 00-.942.942l1.933 1.934a.667.667 0 00.943-.943zM12 7.333h2.667a.667.667 0 110 1.334H12a.667.667 0 010-1.334zm1.4-4.066c0 .176-.07.346-.195.471l-1.933 1.933a.667.667 0 01-.943-.942l1.933-1.934a.667.667 0 011.138.472zM7.333 1.333a.667.667 0 111.334 0V4a.667.667 0 01-1.334 0V1.333z"
              fillRule="evenodd"
              fill={svgProps.color || `url(#${animationId}-gradient)`}
            />
          </g>
        </svg>
      </>
    );
  },
);

HistoryRunningIcon.displayName = 'HistoryRunningIcon';

/**
 * 运行图标容器组件
 *
 * 提供更好的布局控制和样式封装的运行图标容器
 *
 * @param props 组件属性
 * @param props.size 图标大小，可以是数字或字符串
 * @param props.containerStyle 容器样式
 * @param props.iconProps 传递给图标的属性
 * @param props.children 子元素
 *
 * @returns 运行图标容器组件
 */
export interface HistoryRunningIconContainerProps {
  /** 图标大小 */
  size?: number | string;
  /** 容器样式 */
  containerStyle?: React.CSSProperties;
  /** 传递给图标的属性 */
  iconProps?: HistoryRunningIconProps;
  /** 子元素 */
  children?: React.ReactNode;
}

export const HistoryRunningIconContainer: React.FC<HistoryRunningIconContainerProps> =
  React.memo(({ size = 16, containerStyle, iconProps = {}, children }) => {
    const iconSize = typeof size === 'number' ? `${size}px` : size;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize,
          height: iconSize,
          ...containerStyle,
        }}
      >
        <HistoryRunningIcon width={iconSize} height={iconSize} {...iconProps} />
        {children}
      </div>
    );
  });

HistoryRunningIconContainer.displayName = 'HistoryRunningIconContainer';

export default HistoryRunningIcon;
