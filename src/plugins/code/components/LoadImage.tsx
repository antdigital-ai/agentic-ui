/**
 * @fileoverview 图片加载组件，提供图片加载状态管理
 * @author Code Plugin Team
 */

import React, { useState } from 'react';

/**
 * 图片加载组件
 *
 * 功能：
 * - 在图片加载成功前隐藏图片
 * - 图片加载失败时也隐藏图片
 * - 提供平滑的加载体验
 *
 * @param props - 图片元素的属性，支持标准的 img 元素所有属性
 * @returns React 图片元素
 *
 * @example
 * ```tsx
 * <LoadImage
 *   src="https://example.com/icon.png"
 *   alt="Language Icon"
 *   style={{ width: '1em', height: '1em' }}
 * />
 * ```
 */
export const LoadImage = (
  props: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: React.ComponentType<any> | string;
    size?: number | string;
  },
) => {
  // 控制图片显示状态，默认隐藏直到加载成功
  const [show, setShow] = useState(false);

  if (typeof props.src !== 'string' && props.src) {
    const C = props.src;
    return <C size={props.size || '1em'} />;
  }

  return (
    <img
      {...props}
      //@ts-ignore - 处理可能的对象形式的 src（支持 {src: string} 格式）
      src={props.src?.src || props.src}
      style={{
        ...props.style,
        // 只有加载成功后才显示图片
        display: show ? 'block' : 'none',
      }}
      onLoad={() => {
        // 图片加载成功时显示
        setShow(true);
      }}
      onError={() => {
        // 图片加载失败时保持隐藏
        setShow(false);
      }}
    />
  );
};
