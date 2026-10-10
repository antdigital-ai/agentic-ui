import { Avatar, theme, type AvatarProps } from 'antd';

import classNames from 'clsx';
import React from 'react';
import { isEmoji } from './isEmoji';

export interface BubbleAvatarProps
  extends
    AvatarProps,
    React.AriaAttributes,
    Pick<
      React.HTMLAttributes<HTMLElement>,
      'role' | 'tabIndex' | 'onKeyDown' | 'onFocus' | 'onBlur'
    > {
  /**
   * @description The URL or base64 data of the avatar image
   */
  avatar?: string;
  /**
   * @description The background color of the avatar
   */
  background?: string;
  /**
   * @description The shape of the avatar
   * @default 'circle'
   */
  shape?: 'circle' | 'square';
  /**
   * @description The size of the avatar in pixels
   * @default 40
   */
  size?: number;
  /**
   * @description The title text to display if avatar is not provided
   */
  title?: string;

  loading?: boolean;
}

/**
 * @module Avatar
 * @description 头像组件，用于显示用户头像信息
 * @exports Avatar
 * @component
 *
 * @param {string} [avatar] - 头像图片的URL或base64数据
 * @param {string} [background] - 头像的背景颜色
 * @param {'circle' | 'square'} [shape='circle'] - 头像的形状，默认为圆形
 * @param {number} [size=40] - 头像的尺寸（像素）
 * @param {string} [title] - 如果未提供头像，则显示的标题文本
 * @param {string} [className] - 自定义的CSS类名
 * @param {Function} [onClick] - 点击头像时触发的回调函数
 * @param {Object} [style] - 自定义的行内样式
 * @param {Object} [props] - 其他传递给AntAvatar组件的属性
 *
 */
export const BubbleAvatar: React.FC<BubbleAvatarProps> = ({
  className,
  avatar,
  title,
  background,
  size = 24,
  shape = 'circle',
  onClick,
  prefixCls = 'ant-agentic-bubble-avatar',
  style,
  ...props
}) => {
  const { hashId } = theme.useToken();
  const isImage = Boolean(
    avatar && ['/', 'http', 'data:'].some((index) => avatar.startsWith(index)),
  );
  const isBase64 = Boolean(avatar?.startsWith('data'));
  const interactiveProps = onClick
    ? {
        role: props.role ?? 'button',
        tabIndex: props.tabIndex ?? 0,
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          props.onKeyDown?.(event);
          if (event.defaultPrevented || event.repeat) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
          }
        },
      }
    : {};
  const avatarStyle: React.CSSProperties = {
    backgroundColor: background,
    ...(!onClick ? { cursor: 'default' } : {}),
    ...style,
  };

  if (typeof avatar === 'string' && isEmoji(String(avatar))) {
    const {
      gap: _gap,
      icon: _icon,
      src: _src,
      srcSet: _srcSet,
      alt: _alt,
      crossOrigin: _crossOrigin,
      onError: _onError,
      loading: _loading,
      rootClassName,
      ...htmlProps
    } = props;
    return (
      <div
        {...htmlProps}
        {...interactiveProps}
        className={classNames(
          `${prefixCls}-emoji`,
          className,
          rootClassName,
          hashId,
        )}
        style={avatarStyle}
        onClick={onClick}
        data-testid="bubble-avatar"
      >
        {avatar}
      </div>
    );
  }

  const text = String((isImage ? title : (avatar ?? title)) ?? '');

  const avatarProps = {
    className: classNames(className, `${prefixCls}`, hashId),
    shape: shape,
    size,
    style: avatarStyle,
  };

  return isImage ? (
    <Avatar
      src={isBase64 ? avatar : <img src={avatar} alt="avatar" />}
      {...avatarProps}
      {...props}
      {...interactiveProps}
      onClick={onClick}
      data-testid="bubble-avatar"
    />
  ) : (
    <Avatar
      {...avatarProps}
      {...props}
      {...interactiveProps}
      onClick={onClick}
      data-testid="bubble-avatar"
    >
      {text?.toUpperCase().slice(0, 2)}
    </Avatar>
  );
};
