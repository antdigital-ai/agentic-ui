import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, {
  isValidElement,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRefFunction } from '../Hooks/useRefFunction';
import { CloseIcon } from './components/CloseIcon';
import { ErrorIcon } from './components/ErrorIcon';
import { InfoIcon } from './components/InfoIcon';
import { LoaderIcon } from './components/LoaderIcon';
import { SuccessIcon } from './components/SuccessIcon';
import { WarningIcon } from './components/WarningIcon';
import { useStyle } from './style';

/**
 * AnswerAlert 所有可选 type 值的列表（运行时可枚举）。
 *
 * 使用 `as const` 元组而非 `enum`，与项目 TypeScript 规范一致：
 * 类型 {@link AnswerAlertType} 由该数组派生，新增 type 只需在此一处维护。
 */
export const ANSWER_ALERT_TYPES = [
  'success',
  'error',
  'warning',
  'info',
  'gray',
] as const;

/** AnswerAlert 类型联合，由 {@link ANSWER_ALERT_TYPES} 派生 */
export type AnswerAlertType = (typeof ANSWER_ALERT_TYPES)[number];

/**
 * AnswerAlert 组件的属性接口
 * @interface AnswerAlertProps
 */
export interface AnswerAlertProps {
  className?: string;
  style?: React.CSSProperties;
  /** 内容 */
  message?: React.ReactNode;
  /** 辅助性文字介绍 */
  description?: React.ReactNode;
  /** 自定义图标，`showIcon` 为 true 时有效 */
  icon?: React.ReactNode;
  /** 是否显示辅助图标 */
  showIcon?: boolean;
  /** 指定指示器的样式 */
  type?: AnswerAlertType;
  /** 自定义操作项 */
  action?: React.ReactNode;
  /** 可关闭配置 */
  closable?: boolean;
  /** 关闭时触发的回调函数 */
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * 是否启用进入 / 关闭动画。
   * - `true`（默认）：mount 时 fade-in + 轻微下滑；点击关闭时 fade-out + 高度收起，动画结束才真正卸载
   * - `false`：禁用所有动画，立即 mount / unmount，对 SSR、性能敏感场景或测试更友好
   *
   * 当用户系统开启「减少动态效果」（`prefers-reduced-motion: reduce`）时，
   * 即使 `motion = true`，CSS 层面也会自动退化为无动画，无需手动处理。
   */
  motion?: boolean;
}

const iconMapFilled = {
  success: SuccessIcon,
  info: InfoIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  gray: LoaderIcon,
};

/**
 * 类型对应的 ARIA role：
 * - `error` / `warning` 使用 `alert`（高优先级，立即打断屏幕阅读器）
 * - 其余使用 `status`（低优先级，礼貌播报）
 *
 * 无 `type` 时返回 undefined，由调用方决定是否落 role。
 */
function getAriaRole(type?: AnswerAlertType): 'alert' | 'status' | undefined {
  if (!type) return undefined;
  if (type === 'error' || type === 'warning') return 'alert';
  return 'status';
}

interface IconNodeProps {
  type: AnswerAlertProps['type'];
  icon: AnswerAlertProps['icon'];
  prefixCls: string;
  hashId: string;
}

/** 自定义 icon 元素允许携带的最小 props 集合（仅约束 className） */
type IconElementProps = { className?: string };

const IconNode: React.FC<IconNodeProps> = memo((props) => {
  const { icon, prefixCls, type, hashId } = props;
  const iconType = type ? iconMapFilled[type] : null;

  // 使用提前返回优化
  if (icon) {
    if (!isValidElement(icon)) {
      return (
        <span className={classNames(`${prefixCls}-icon`, hashId)}>{icon}</span>
      );
    }
    // 只读取 className，避免 `as any` 丢失类型
    const iconElement = icon as React.ReactElement<IconElementProps>;
    return React.cloneElement(iconElement, {
      className: classNames(
        `${prefixCls}-icon`,
        hashId,
        iconElement.props.className,
      ),
    });
  }

  if (!iconType) {
    return null;
  }

  return React.createElement(iconType, {
    className: classNames(`${prefixCls}-icon`, hashId),
  });
});

IconNode.displayName = 'IconNode';

/**
 * AnswerAlert 组件 - 答案提示组件
 *
 * 该组件用于显示各种类型的提示信息，支持成功、错误、警告、信息等多种状态。
 * 提供图标显示、关闭功能、自定义操作等特性，适用于消息提示、状态反馈等场景。
 *
 * @component
 * @description 答案提示组件，用于显示各种类型的提示信息
 * @param {AnswerAlertProps} props - 组件属性
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {React.ReactNode} [props.message] - 提示内容
 * @param {React.ReactNode} [props.description] - 辅助性文字介绍
 * @param {React.ReactNode} [props.icon] - 自定义图标
 * @param {boolean} [props.showIcon] - 是否显示辅助图标
 * @param {'success' | 'error' | 'warning' | 'info' | 'gray'} [props.type] - 提示类型
 * @param {React.ReactNode} [props.action] - 自定义操作项
 * @param {boolean} [props.closable] - 是否可关闭
 * @param {(e: React.MouseEvent<HTMLButtonElement>) => void} [props.onClose] - 关闭回调
 *
 * @example
 * ```tsx
 * <AnswerAlert
 *   type="success"
 *   message="操作成功"
 *   description="您的操作已经成功完成"
 *   showIcon={true}
 *   closable={true}
 *   onClose={() => console.log('关闭提示')}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的答案提示组件
 *
 * @remarks
 * - 支持多种提示类型（成功、错误、警告、信息、灰色）
 * - 提供图标显示功能
 * - 支持自定义操作项
 * - 支持关闭功能
 * - 提供描述文字显示
 * - 支持自定义样式和类名
 * - 响应式布局适配
 */
const AnswerAlertComponent: React.FC<AnswerAlertProps> = ({
  className,
  style,
  message,
  description,
  icon,
  showIcon,
  type,
  action,
  closable,
  onClose,
  motion = true,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('answer-alert');
  const { hashId } = useStyle(prefixCls);

  // 关闭流程为两阶段，避免动画被截断：
  // - `closing`：用户已点击关闭，正在播放退出动画，DOM 仍在
  // - `closed`：动画结束（或 motion=false 时立即），节点真正从树上移除
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 useCallback 优化关闭处理函数
  const handleClose = useRefFunction(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // 已经在退出流程中，忽略后续点击，确保 onClose 只触发一次
      if (closing || closed) return;
      onClose?.(e);
      if (motion) {
        // 进入退出动画阶段，等 animationend / transitionend 后再 unmount
        setClosing(true);
      } else {
        setClosed(true);
      }
    },
  );

  // 监听退出动画结束 → 真正卸载
  // 用 animationend + transitionend 双重兜底（不同浏览器对 keyframes / transition 触发差异）
  useEffect(() => {
    if (!closing) return;
    const node = containerRef.current;
    if (!node) {
      // 极端兜底：拿不到节点就直接 unmount，避免卡在 closing 态
      setClosed(true);
      return;
    }

    const finish = (e: AnimationEvent | TransitionEvent) => {
      // 仅响应容器自身的动画/过渡，避免子元素冒泡误触发
      if (e.target !== node) return;
      setClosed(true);
    };

    node.addEventListener('animationend', finish);
    node.addEventListener('transitionend', finish);

    // 兜底超时：动画意外被打断（如父级 display:none）也能正常卸载
    const fallback = window.setTimeout(() => setClosed(true), 400);

    return () => {
      node.removeEventListener('animationend', finish);
      node.removeEventListener('transitionend', finish);
      window.clearTimeout(fallback);
    };
  }, [closing]);

  // 使用提前返回优化
  if (closed) {
    return null;
  }

  const alertCls = classNames(
    prefixCls,
    className,
    {
      [`${prefixCls}-${type}`]: !!type,
      [`${prefixCls}-with-description`]: !!description,
      [`${prefixCls}-motion`]: motion,
      [`${prefixCls}-closing`]: closing,
    },
    hashId,
  );

  return (
    <div
      ref={containerRef}
      className={alertCls}
      data-testid={prefixCls}
      style={style}
      role={getAriaRole(type)}
      aria-live={
        type === 'error' || type === 'warning' ? 'assertive' : 'polite'
      }
    >
      <div className={classNames(`${prefixCls}-content`, hashId)}>
        {showIcon ? (
          <IconNode
            icon={icon}
            prefixCls={prefixCls}
            type={type}
            hashId={hashId}
          />
        ) : null}
        <div className={classNames(`${prefixCls}-message`, hashId)}>
          {message}
        </div>
        {action ? (
          <div className={classNames(`${prefixCls}-action`, hashId)}>
            {action}
          </div>
        ) : null}
        {closable && (
          <button
            type="button"
            className={classNames(`${prefixCls}-close-icon`, hashId)}
            tabIndex={0}
            aria-label="Close"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        )}
      </div>
      {description ? (
        <div className={classNames(`${prefixCls}-description`, hashId)}>
          {description}
        </div>
      ) : null}
    </div>
  );
};

AnswerAlertComponent.displayName = 'AnswerAlert';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const AnswerAlert = memo(AnswerAlertComponent);

// memo 包装会丢失内部组件 displayName，显式补回，便于 DevTools / 测试 snapshot 识别
(AnswerAlert as unknown as { displayName?: string }).displayName =
  'AnswerAlert';
