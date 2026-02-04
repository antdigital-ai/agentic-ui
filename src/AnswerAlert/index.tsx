import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, {
  isValidElement,
  memo,
  useCallback,
  useContext,
  useState,
} from 'react';
import { CloseIcon } from './components/CloseIcon';
import { ErrorIcon } from './components/ErrorIcon';
import { InfoIcon } from './components/InfoIcon';
import { LoaderIcon } from './components/LoaderIcon';
import { SuccessIcon } from './components/SuccessIcon';
import { WarningIcon } from './components/WarningIcon';
import { useStyle } from './style';

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
  type?: 'success' | 'error' | 'warning' | 'info' | 'gray';
  /** 自定义操作项 */
  action?: React.ReactNode;
  /** 可关闭配置 */
  closable?: boolean;
  /** 关闭时触发的回调函数 */
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const iconMapFilled = {
  success: SuccessIcon,
  info: InfoIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  gray: LoaderIcon,
};

interface IconNodeProps {
  type: AnswerAlertProps['type'];
  icon: AnswerAlertProps['icon'];
  prefixCls: string;
  hashId: string;
}

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
    return React.cloneElement(icon as React.ReactElement<any>, {
      className: classNames(`${prefixCls}-icon`, hashId, icon.props.className),
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
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('answer-alert');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const [closed, setClosed] = useState(false);

  // 使用 useCallback 优化关闭处理函数
  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setClosed(true);
      onClose?.(e);
    },
    [onClose],
  );

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
    },
    hashId,
  );

  return wrapSSR(
    <div className={alertCls} style={style}>
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
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <div className={classNames(`${prefixCls}-description`, hashId)}>
        {description}
      </div>
    </div>,
  );
};

AnswerAlertComponent.displayName = 'AnswerAlert';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const AnswerAlert = memo(AnswerAlertComponent);
