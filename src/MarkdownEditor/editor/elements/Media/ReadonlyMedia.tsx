import { LoadingOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { ElementProps, MediaNode } from '../../../el';
import { MediaErrorLink } from '../../components/MediaErrorLink';
import { useGetSetState } from '../../utils';
import {
  shouldRenderUrlAsPlainText,
  UNSAFE_URL_PLAIN_TEXT_STYLE,
} from '../../../../Utils/htmlUrlSafety';
import { getMediaType } from '../../utils/dom';
import { ReadonlyImage } from '../Image';

/**
 * ReadonlyMedia 组件 - 只读媒体预览组件
 *
 * 专门针对 readonly 模式优化的媒体组件，移除了编辑相关功能（调整大小、删除等）。
 * 简化渲染逻辑，提升预览模式性能。
 *
 * @component
 * @description 只读媒体预览组件，用于预览模式下的媒体渲染
 * @param {ElementProps<MediaNode>} props - 组件属性
 * @param {MediaNode} props.element - 媒体节点元素
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {Object} props.attributes - 元素属性
 *
 * @example
 * ```tsx
 * <ReadonlyMedia
 *   element={mediaNode}
 *   attributes={attributes}
 * >
 *   媒体内容
 * </ReadonlyMedia>
 * ```
 *
 * @returns {React.ReactElement} 渲染的只读媒体组件
 *
 * @remarks
 * - 移除调整大小功能
 * - 移除删除功能
 * - 移除选择状态管理
 * - 简化状态管理逻辑
 * - 使用 React.memo 优化性能
 * - 保持预览模式的视觉效果
 */
export const ReadonlyMedia: React.FC<ElementProps<MediaNode>> = React.memo(
  ({ element, attributes, children }) => {
    const [showAsText, setShowAsText] = useState(false);

    const [state, setState] = useGetSetState({
      loadSuccess: true,
      url: '',
      type: getMediaType(element?.url, element.alt),
    });

    const unsafeUrlPlainText = element?.url
      ? shouldRenderUrlAsPlainText(element.url)
      : false;

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
      const finalType = ['image', 'video', 'autio', 'attachment'].includes(
        type!,
      )
        ? type!
        : 'other';
      setState({
        type: finalType,
      });
      let realUrl = element?.url;

      setState({ url: realUrl });
      if (finalType === 'image' || finalType === 'other') {
        const img = document.createElement('img');
        img.referrerPolicy = 'no-referrer';
        img.crossOrigin = 'anonymous';
        img.src = realUrl!;
        img.onerror = () => {
          setState({ loadSuccess: false });
        };
        img.onload = () => setState({ loadSuccess: true });
      }
      if (finalType === 'video') {
        const video = document.createElement('video');
        video.src = realUrl!;
        video.preload = 'metadata';
        video.onerror = () => {
          setState({ loadSuccess: false });
        };
        video.onloadedmetadata = () => {
          setState({ loadSuccess: true });
        };
      }
      if (finalType === 'audio') {
        const audio = document.createElement('audio');
        audio.src = realUrl!;
        audio.preload = 'metadata';
        audio.onerror = () => {
          setState({ loadSuccess: false });
        };
        audio.onloadedmetadata = () => {
          setState({ loadSuccess: true });
        };
      }
    });

    useLayoutEffect(() => {
      initial();
    }, [element?.url]);

    // 图片预览
    const imageDom = useMemo(() => {
      if (state().type !== 'image' && state().type !== 'other') return null;

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
      element.finished,
      showAsText,
      element.url,
      element.alt,
      element.width,
      element.height,
    ]);

    // 媒体元素预览（video、audio、attachment）
    const mediaElement = useMemo(() => {
      const rawMarkdown =
        (element as any)?.rawMarkdown ||
        (element as any)?.otherProps?.rawMarkdown;

      if (state().type === 'video') {
        // 如果是不完整状态
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
                {element.alt || element.url || '视频链接'}
              </div>
            );
          }
          // 5 秒内显示 loading 占位符
          return <Skeleton.Image active />;
        }

        if (!state().loadSuccess) {
          return (
            <MediaErrorLink
              url={state()?.url}
              fallbackUrl={element?.url}
              displayText={
                element.alt || state()?.url || element?.url || '视频链接'
              }
            />
          );
        }
        return (
          <video
            data-testid="video-element"
            controls={element.controls !== false}
            autoPlay={element.autoplay}
            loop={element.loop}
            muted={element.muted}
            poster={element.poster}
            style={{
              width: element.width ? `${element.width}px` : '100%',
              height: element.height ? `${element.height}px` : 'auto',
              maxWidth: '100%',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'block',
            }}
            src={state()?.url || ''}
            preload="metadata"
            onError={() => {
              console.warn('Video failed to load:', state()?.url);
              setState({ loadSuccess: false });
            }}
          />
        );
      }

      if (state().type === 'audio') {
        // 如果是不完整状态
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
                {element.alt || element.url || '音频链接'}
              </div>
            );
          }
          // 5 秒内显示 loading 占位符
          return (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                border: '1px dashed #d9d9d9',
                borderRadius: '6px',
                backgroundColor: '#fafafa',
                minWidth: '200px',
                justifyContent: 'center',
              }}
            >
              <LoadingOutlined
                style={{ color: '#1890ff', fontSize: '16px' }}
                spin
              />
              <span
                style={{
                  color: '#666',
                  fontSize: '13px',
                  wordBreak: 'break-all',
                }}
              >
                {rawMarkdown || element?.alt || '音频加载中...'}
              </span>
            </div>
          );
        }

        if (!state().loadSuccess) {
          return (
            <MediaErrorLink
              url={state()?.url}
              fallbackUrl={element?.url}
              displayText={
                element.alt || state()?.url || element?.url || '音频链接'
              }
            />
          );
        }
        return (
          <audio
            data-testid="audio-element"
            controls
            style={{
              width: '100%',
              height: 'auto',
            }}
            src={state()?.url || ''}
            onError={() => {
              console.warn('Audio failed to load:', state()?.url);
              setState({ loadSuccess: false });
            }}
          >
            Your browser does not support the
            <code>audio</code> element.
          </audio>
        );
      }

      if (state().type === 'attachment') {
        return (
          <div
            style={{
              padding: 12,
              boxSizing: 'border-box',
              border: '1px solid #f0f0f0',
              borderRadius: '0.5em',
              width: '100%',
              backgroundImage:
                'linear-gradient(rgb(249, 251, 255) 0%, rgb(243, 248, 255) 100%)',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#262626',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: '#262626',
                fontSize: 16,
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '0.25em',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                📎
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {element.alt || element.url || '附件'}
              </div>
            </div>
            <div
              data-icon-box
              style={{
                padding: '0 18px',
              }}
            >
              <a
                href={state()?.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 16,
                  cursor: 'pointer',
                  color: '#1677ff',
                }}
              >
                查看
              </a>
            </div>
          </div>
        );
      }
      return null;
    }, [
      state().type,
      state()?.url,
      element.finished,
      showAsText,
      (element as any)?.rawMarkdown,
      element.url,
      element.alt,
      element.width,
      element.height,
      element.controls,
      element.autoplay,
      element.loop,
      element.muted,
      element.poster,
      state().loadSuccess,
    ]);

    if (unsafeUrlPlainText && element?.url) {
      return (
        <div {...attributes}>
          <div
            data-be="media"
            data-testid="media-unsafe-url-plain-text"
            style={{
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
            contentEditable={false}
          >
            <span style={UNSAFE_URL_PLAIN_TEXT_STYLE}>{element.url}</span>
            <div style={{ display: 'none' }}>{children}</div>
          </div>
        </div>
      );
    }

    return (
      <div {...attributes}>
        <div
          data-be="media"
          data-testid="media-container"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
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
              width: mediaElement ? '100%' : undefined,
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
            draggable={false}
            contentEditable={false}
            data-be="media-container"
          >
            {mediaElement}
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
      </div>
    );
  },
);

ReadonlyMedia.displayName = 'ReadonlyMedia';
