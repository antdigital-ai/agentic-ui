import { Skeleton } from 'antd';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { ElementProps, MediaNode } from '../../../el';
import { MediaErrorLink } from '../../components/MediaErrorLink';
import { useGetSetState } from '../../utils';
import { getMediaType } from '../../utils/dom';
import { ReadonlyImage } from './index';

/**
 * ReadonlyEditorImage 组件 - 只读图片预览组件
 *
 * 专门针对 readonly 模式优化的图片组件，移除了调整大小、选择等编辑相关功能。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读图片预览组件，用于预览模式下的图片渲染
 * @param {ElementProps<MediaNode>} props - 组件属性
 * @param {MediaNode} props.element - 图片节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyEditorImage
 *   element={imageNode}
 *   attributes={attributes}
 * >
 *   内容
 * </ReadonlyEditorImage>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读图片组件
 *
 * @remarks
 * - 移除调整大小功能
 * - 移除选择状态管理
 * - 保留加载状态和错误处理
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyEditorImage: React.FC<ElementProps<MediaNode>> =
  React.memo((props) => {
    const { element, attributes, children } = props;
    const htmlRef = React.useRef<HTMLDivElement>(null);
    const [showAsText, setShowAsText] = useState(false);
    const [state, setState] = useGetSetState({
      loadSuccess: true,
      url: '',
      type: getMediaType(element?.url, element.alt),
    });

    // 如果 finished 为 false，设置 5 秒超时，超时后显示为文本
    useEffect(() => {
      if (element.finished === false) {
        setShowAsText(false);
        const timer = setTimeout(() => {
          setShowAsText(true);
        }, 5000);

        return () => {
          clearTimeout(timer);
        };
      } else {
        setShowAsText(false);
      }
    }, [element.finished]);

    const initial = useRefFunction(async () => {
      let type = getMediaType(element?.url, element.alt);
      type = !type ? 'image' : type;
      setState({
        type: ['image', 'video', 'autio', 'attachment'].includes(type!)
          ? type!
          : 'other',
      });
      let realUrl = element?.url;

      setState({ url: realUrl });
      if (state().type === 'image' || state().type === 'other') {
        const img = document.createElement('img');
        img.referrerPolicy = 'no-referrer';
        img.crossOrigin = 'anonymous';
        img.src = realUrl!;
        img.onerror = () => {
          setState({ loadSuccess: false });
        };
        img.onload = () => {
          setState({ loadSuccess: true });
        };
      }
    });

    useLayoutEffect(() => {
      initial();
    }, [element?.url, initial]);

    // 图片预览 DOM
    const imageDom = React.useMemo(() => {
      // 检查是否为不完整的图片（finished 状态）
      if (element.finished === false) {
        // 如果 5 秒后仍未完成，显示为文本
        if (showAsText) {
          return (
            <div
              style={{
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                color: 'rgba(0, 0, 0, 0.65)',
                wordBreak: 'break-all',
              }}
            >
              {element.alt || element.url || '图片链接'}
            </div>
          );
        }
        // 5 秒内显示 loading 状态的占位符
        return <Skeleton.Image active />;
      }

      // 如果图片加载失败，显示为链接
      if (!state().loadSuccess) {
        return (
          <MediaErrorLink
            url={state()?.url}
            fallbackUrl={element?.url}
            displayText={
              element?.alt || state()?.url || element?.url || '图片链接'
            }
            style={{
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          />
        );
      }

      return (
        <ReadonlyImage
          src={state()?.url || element?.url}
          alt={element?.alt || 'image'}
          width={element.width}
          height={element.height}
          crossOrigin="anonymous"
        />
      );
    }, [
      state().type,
      state()?.url,
      state().loadSuccess,
      element.finished,
      showAsText,
      element.url,
      element.alt,
      element.width,
      element.height,
    ]);

    return (
      <div
        {...attributes}
        data-be="image"
        data-testid="image-container"
        style={{
          position: 'relative',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
        draggable={false}
      >
        <div
          tabIndex={-1}
          style={{
            color: 'transparent',
            padding: 4,
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            width: imageDom ? '100%' : undefined,
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
          ref={htmlRef}
          draggable={false}
          contentEditable={false}
          data-be="image-container"
        >
          {imageDom}
          <div
            style={{
              display: 'none',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  });

ReadonlyEditorImage.displayName = 'ReadonlyEditorImage';
