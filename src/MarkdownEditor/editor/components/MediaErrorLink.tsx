import { ExclamationCircleOutlined } from '@ant-design/icons';
import { SquareArrowUpRight } from '@sofa-design/icons';
import React from 'react';
import { useEditorStore } from '../store';

/**
 * 媒体加载失败时的错误链接组件属性
 */
interface MediaErrorLinkProps {
  /** 链接地址 */
  url: string | undefined;
  /** 备用链接地址 */
  fallbackUrl?: string | undefined;
  /** 显示文本 */
  displayText: string;
  /** 可选的样式覆盖 */
  style?: React.CSSProperties;
}

/**
 * 媒体加载失败时的错误链接组件
 *
 * 当图片、视频或音频加载失败时，显示一个可点击的链接
 * 支持自定义链接点击行为和打开方式
 *
 * @param props - 组件属性
 * @returns 错误链接元素
 *
 * @example
 * ```tsx
 * <MediaErrorLink
 *   url="https://example.com/image.jpg"
 *   displayText="图片链接"
 * />
 * ```
 */
const MediaErrorLinkComponent = ({
  url,
  fallbackUrl,
  displayText,
  style,
}: MediaErrorLinkProps) => {
  const { editorProps } = useEditorStore();

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    const finalUrl = url || fallbackUrl;
    if (!finalUrl) return;
    e.stopPropagation();
    e.preventDefault();
    if (editorProps.linkConfig?.onClick) {
      if (editorProps.linkConfig.onClick(finalUrl) === false) {
        return;
      }
    }
    if (editorProps?.linkConfig?.openInNewTab !== false) {
      window.open(finalUrl, '_blank');
    } else {
      window.open(finalUrl, '_self');
    }
  };

  return (
    <span
      onClick={handleClick}
      style={{
        color: '#1890ff',
        textDecoration: 'underline',
        wordBreak: 'break-all',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '100%',
        padding: '8px 12px',
        border: '1px dashed #d9d9d9',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        ...style,
      }}
    >
      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      {displayText}
      <SquareArrowUpRight />
    </span>
  );
};

export const MediaErrorLink = React.memo(MediaErrorLinkComponent);
