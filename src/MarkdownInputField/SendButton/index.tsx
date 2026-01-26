import { ConfigProvider, Tooltip } from 'antd';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { StopIcon } from '../../AgentRunBar/icons';
import { I18nContext } from '../../I18n';
import { useStyle } from './style';

/**
 * 按钮颜色配置
 */
export type SendButtonColors = {
  /** 默认状态下的图标颜色 */
  icon?: string;
  /** Hover 状态下的图标颜色 */
  iconHover?: string;
  /** 默认状态下的背景颜色 */
  background?: string;
  /** Hover 状态下的背景颜色 */
  backgroundHover?: string;
};

/**
 * 按钮定制化属性
 */
export type SendButtonCustomizationProps = {
  compact?: boolean;
  colors?: SendButtonColors;
};

const DEFAULT_SEND_BUTTON_COLORS = {
  icon: '#00183D',
  iconHover: '#fff',
  background: '#001C39',
  backgroundHover: '#14161C',
};

function SendIcon(
  props: React.SVGProps<SVGSVGElement> & {
    hover?: boolean;
    disabled?: boolean;
    typing?: boolean;
    onInit?: () => void;
    colors?: SendButtonColors;
  },
) {
  const { hover, typing, onInit, colors, ...rest } = props;

  useEffect(() => {
    onInit?.();
  }, []);

  if (typing) {
    return <StopIcon {...rest} />;
  }

  const currentColors = {
    icon: colors?.icon ?? DEFAULT_SEND_BUTTON_COLORS.icon,
    iconHover: colors?.iconHover ?? DEFAULT_SEND_BUTTON_COLORS.iconHover,
    background: colors?.background ?? DEFAULT_SEND_BUTTON_COLORS.background,
    backgroundHover:
      colors?.backgroundHover ?? DEFAULT_SEND_BUTTON_COLORS.backgroundHover,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...rest}
    >
      <motion.circle
        cx="50%"
        cy="50%"
        r="0.5em"
        initial={false}
        animate={{
          fill: hover
            ? currentColors.backgroundHover
            : currentColors.background,
          fillOpacity: hover ? 1 : 0.03530000150203705,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      ></motion.circle>
      <g>
        <motion.path
          d="M16.667 12.943l3.528 3.528a.667.667 0 00.943-.942l-4.666-4.667a.665.665 0 00-.943 0l-4.667 4.667a.667.667 0 10.943.942l3.528-3.528v7.724a.667.667 0 101.334 0v-7.724z"
          fillRule="evenodd"
          initial={false}
          animate={{
            fill: hover ? currentColors.iconHover : currentColors.icon,
            fillOpacity: hover ? 1 : 0.24709999561309814,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        ></motion.path>
      </g>
    </svg>
  );
}

/**
 * Props for the SendButton component.
 */
type SendButtonProps = {
  /**
   * 指示按钮是可以发送状态
   * Indicates whether the button is in a sendable state.
   */
  isSendable: boolean;

  /**
   * 指示用户是否正在输入
   * Indicates whether the user is currently typing.
   */
  typing: boolean;

  /**
   * 点击按钮时触发的回调函数
   * Callback function triggered when the button is clicked.
   */
  onClick: () => void;

  /**
   * 应用于按钮的CSS样式
   * CSS styles to be applied to the button.
   */
  style?: React.CSSProperties;

  /**
   * 按钮初始化时触发的回调函数
   * Callback function triggered when the button is initialized.
   */
  onInit?: () => void;

  /**
   * 是否使用紧凑模式显示按钮
   * Whether to display the button in compact mode.
   */
  compact?: boolean;

  /**
   * 按钮是否禁用
   * Whether the button is disabled.
   */
  disabled?: boolean;

  /**
   * 自定义按钮颜色
   * Custom colors for the button.
   */
  colors?: SendButtonColors;

  /**
   * 触发发送的快捷键
   */
  triggerSendKey?: 'Enter' | 'Mod+Enter';
};

/**
 * SendButton 组件 - 发送按钮组件
 *
 * 该组件提供一个可点击的发送按钮，根据不同状态（悬停、禁用、输入中）
 * 呈现不同的视觉效果和动画。支持紧凑模式和自定义样式。
 *
 * @component
 * @description 发送按钮组件，支持多种状态和动画效果
 * @param {SendButtonProps} props - 组件属性
 * @param {boolean} props.isHover - 指示鼠标是否悬停在按钮上
 * @param {boolean} props.disabled - 指示按钮是否禁用
 * @param {boolean} props.typing - 指示是否处于输入状态
 * @param {() => void} props.onClick - 点击按钮时的回调函数
 * @param {React.CSSProperties} [props.style] - 应用于按钮容器的自定义样式
 * @param {() => void} [props.onInit] - 组件初始化时调用的可选回调函数
 * @param {boolean} [props.compact] - 是否使用紧凑模式样式
 * @param {SendButtonColors} [props.colors] - 自定义按钮颜色
 *
 * @example
 * ```tsx
 * <SendButton
 *   isHover={false}
 *   disabled={false}
 *   typing={false}
 *   onClick={() => console.log('发送消息')}
 *   compact={false}
 *   colors={{
 *     icon: '#666',
 *     iconHover: '#fff',
 *     background: '#f0f0f0',
 *     backgroundHover: '#1890ff'
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement|null} 渲染的发送按钮组件，SSR环境下返回null
 *
 * @remarks
 * - 支持悬停、禁用、输入中等多种状态
 * - 提供流畅的动画效果
 * - 支持紧凑模式显示
 * - 支持自定义颜色配置
 * - 在SSR环境下不渲染
 */
export const SendButton: React.FC<SendButtonProps> = (props) => {
  const { isSendable, disabled, typing, onClick, style, colors, triggerSendKey = 'Enter' } = props;
  useEffect(() => {
    props.onInit?.();
  }, []);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const baseCls = getPrefixCls('agentic-md-input-field-send-button');
  const { wrapSSR, hashId } = useStyle(baseCls);

  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !window.document
  ) {
    // SSR 环境下不渲染
    return null;
  }

  const sendText =
    (triggerSendKey === 'Mod+Enter'
      ? locale?.['input.sendButtonTooltip.send.mod']
      : locale?.['input.sendButtonTooltip.send']) ||
    (triggerSendKey === 'Mod+Enter' ? '按 Cmd/Ctrl+Enter 键发送' : '按 Enter 键发送');

  const newlineText =
    (triggerSendKey === 'Mod+Enter'
      ? locale?.['input.sendButtonTooltip.newline.mod']
      : locale?.['input.sendButtonTooltip.newline']) ||
    (triggerSendKey === 'Mod+Enter' ? '按 Enter 键换行' : '按 Shift+Enter 键换行');

  const tooltipTitle = (
    <div style={{ lineHeight: '1.5', textAlign: 'left' }}>
      <div>{sendText}</div>
      <div>{newlineText}</div>
    </div>
  );

  return wrapSSR(
    <Tooltip arrow={false} title={tooltipTitle} mouseEnterDelay={0.5}>
      <div
        data-testid="send-button"
        onClick={() => {
          if (!disabled) {
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // 防止键盘事件触发 click 事件
            onClick();
          }
        }}
        style={style}
        className={classNames(baseCls, hashId, {
          [`${baseCls}-compact`]: props.compact,
          [`${baseCls}-disabled`]: disabled,
          [`${baseCls}-typing`]: typing,
        })}
      >
        <ErrorBoundary fallback={<div />}>
          <SendIcon
            hover={isSendable && !disabled}
            disabled={disabled}
            typing={typing}
            colors={colors}
          />
        </ErrorBoundary>
      </div>
    </Tooltip>,
  );
};
