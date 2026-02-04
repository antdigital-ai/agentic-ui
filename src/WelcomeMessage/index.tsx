import { ConfigProvider } from 'antd';
import classnames from 'classnames';
import React, { useContext } from 'react';
import { TextAnimate, TextAnimateProps } from '../Components/TextAnimate';
import {
  TypingAnimation,
  TypingAnimationProps,
} from '../Components/TypingAnimation';
import { useStyle } from './style';

export type WelcomeMessageTitleAnimateProps = Pick<
  TypingAnimationProps,
  | 'duration'
  | 'typeSpeed'
  | 'deleteSpeed'
  | 'delay'
  | 'pauseDelay'
  | 'loop'
  | 'startOnView'
  | 'showCursor'
  | 'blinkCursor'
  | 'cursorStyle'
>;

export type WelcomeMessageDescriptionAnimateProps = Pick<
  TextAnimateProps,
  | 'delay'
  | 'duration'
  | 'variants'
  | 'by'
  | 'startOnView'
  | 'once'
  | 'animation'
>;

/**
 * WelcomeMessage 组件的属性接口
 * @interface WelcomeMessageProps
 */
export interface WelcomeMessageProps {
  /** 标题 */
  title?: React.ReactNode;
  /** 描述 */
  description?: React.ReactNode;
  /** 自定义样式类名，用于各个提示项的不同部分 */
  classNames?: {
    title?: string;
    description?: string;
  };
  /** 标题动画属性 */
  titleAnimateProps?: WelcomeMessageTitleAnimateProps;
  /** 描述动画属性 */
  descriptionAnimateProps?: WelcomeMessageDescriptionAnimateProps;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义根节点样式类名 */
  rootClassName?: string;
}

/**
 * WelcomeMessage 组件 - 欢迎消息组件
 *
 * 该组件用于显示聊天开始时的欢迎消息，包含标题和描述信息。
 * 适用于聊天机器人、客服系统等场景的初始欢迎界面。
 *
 * @component
 * @description 欢迎消息组件，用于显示聊天开始时的欢迎信息
 * @param {WelcomeMessageProps} props - 组件属性
 * @param {React.ReactNode} [props.title] - 欢迎标题
 * @param {string} [props.description] - 欢迎描述
 * @param {Object} [props.classNames] - 自定义样式类名
 * @param {string} [props.classNames.title] - 标题样式类名
 * @param {string} [props.classNames.description] - 描述样式类名
 * @param {WelcomeMessageTitleAnimateProps} [props.titleAnimateProps] - 标题动画属性
 * @param {WelcomeMessageDescriptionAnimateProps} [props.descriptionAnimateProps] - 描述动画属性
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {string} [props.rootClassName] - 根节点样式类名
 *
 * @example
 * ```tsx
 * <WelcomeMessage
 *   title="欢迎使用 AI 助手"
 *   description="我可以帮助您解答问题、提供建议和完成任务"
 *   classNames={{
 *     title: 'custom-title',
 *     description: 'custom-description'
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的欢迎消息组件
 *
 * @remarks
 * - 支持自定义标题和描述
 * - 提供灵活的样式配置
 * - 支持 React.ReactNode 类型内容
 * - 集成 Ant Design 主题系统
 * - 响应式布局适配
 */
export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  title,
  description,
  classNames,
  titleAnimateProps,
  descriptionAnimateProps,
  style: customStyle,
  rootClassName,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-welcome');
  const { wrapSSR, hashId } = useStyle(prefixCls);
  const { ...restStyle } = customStyle || {};

  return wrapSSR(
    <div
      className={classnames(prefixCls, hashId, rootClassName)}
      style={restStyle}
    >
      {/* Title */}
      {title && (
        <TypingAnimation
          as="div"
          {...titleAnimateProps}
          className={classnames(`${prefixCls}-title`, classNames?.title)}
        >
          {title}
        </TypingAnimation>
      )}

      {/* Description */}
      {description && (
        <TextAnimate
          as="div"
          animation="blurInUp"
          by="character"
          once
          {...descriptionAnimateProps}
          className={classnames(
            `${prefixCls}-description`,
            classNames?.description,
          )}
        >
          {description}
        </TextAnimate>
      )}
    </div>,
  );
};
