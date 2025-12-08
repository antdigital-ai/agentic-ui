import { DeleteFilled, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { Modal, Popover, Skeleton } from 'antd';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRefFunction } from '../../../../Hooks/useRefFunction';

import { useDebounceFn } from '@ant-design/pro-components';
import { Rnd } from 'react-rnd';
import { Transforms } from 'slate';
import { ActionIconBox } from '../../../../Components/ActionIconBox';
import { I18nContext } from '../../../../I18n';
import { ElementProps, MediaNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { AvatarList } from '../../components/ContributorAvatar';
import { MediaErrorLink } from '../../components/MediaErrorLink';
import { useEditorStore } from '../../store';
import { useGetSetState } from '../../utils';
import { getMediaType } from '../../utils/dom';
import { ReadonlyImage } from '../Image';

/**
 * 可调整大小的图片组件的属性接口
 */
interface ResizeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 调整大小开始时的回调函数 */
  onResizeStart?: () => void;
  /** 调整大小结束时的回调函数 */
  onResizeStop?: (size: {
    width: number | string;
    height: number | string;
  }) => void;
  /** 默认尺寸配置 */
  defaultSize?: { width?: number; height?: number };
  /** 是否被选中状态 */
  selected?: boolean;
}

/**
 * 可调整大小的图片组件
 *
 * 功能特性：
 * - 支持拖拽调整图片尺寸
 * - 保持图片宽高比
 * - 加载状态处理
 * - 选中状态视觉反馈
 * - 响应式尺寸调整
 *
 * @param props - 组件属性
 * @returns 可调整大小的图片元素
 *
 * @example
 * ```tsx
 * <ResizeImage
 *   src="image.jpg"
 *   selected={true}
 *   defaultSize={{ width: 300, height: 200 }}
 *   onResizeStop={(size) => console.log('新尺寸:', size)}
 * />
 * ```
 */
export const ResizeImage = ({
  onResizeStart,
  onResizeStop,
  selected,
  defaultSize,
  ...props
}: ResizeImageProps) => {
  const [loading, setLoading] = React.useState(true);
  const radio = useRef<number>(1);
  const [size, setSize] = React.useState({
    width: defaultSize?.width || 400,
    height: defaultSize?.height || 0,
  } as {
    width: number | string;
    height: number | string;
  });
  const imgRef = useRef<HTMLImageElement>(null);

  //@ts-expect-error
  const resize = useDebounceFn((size) => {
    setSize({
      width: size.width,
      height: size.width / radio.current,
    });
    imgRef.current?.style.setProperty('width', `${size.width}px`);
    imgRef.current?.style.setProperty(
      'height',
      `${(size.width || 0) / radio.current}px`,
    );
  }, 160);

  return (
    <div
      data-testid="resize-image-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        overflow: 'hidden',
        width: size.width as number,
        height: size.height as number,
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {loading ? (
        <div
          style={{
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 12,
          }}
        >
          <LoadingOutlined
            style={{
              fontSize: 24,
              color: '#1890ff',
            }}
          />
        </div>
      ) : null}
      <Rnd
        onResizeStart={onResizeStart}
        onResizeStop={() => {
          onResizeStop?.(size);
        }}
        default={{
          x: 0,
          y: 0,
          width: '100%',
          height: '100%',
        }}
        size={size}
        disableDragging
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        onResize={(_, dir, ele) => {
          imgRef.current?.style.setProperty('width', `${ele.clientWidth}px`);
          imgRef.current?.style.setProperty(
            'height',
            `${(ele.clientWidth || 0) / radio.current}px`,
          );

          resize.cancel();
          resize.run({
            width: ele.clientWidth,
            height: (ele.clientWidth || 0) / radio.current,
          });
        }}
      >
        <img
          data-testid="resize-image"
          draggable={false}
          onLoad={(e) => {
            setLoading(false);
            let width = (e.target as HTMLImageElement).naturalWidth;
            const height = (e.target as HTMLImageElement).naturalHeight;
            radio.current = width / height;
            const containerWidth =
              document.documentElement.clientWidth || window.innerWidth || 600;
            const maxAllowedWidth = Math.min(containerWidth * 0.9, 600);
            width = Math.min(width, maxAllowedWidth);

            setSize({
              width: width,
              height: width / radio.current,
            });
          }}
          alt={'image'}
          referrerPolicy={'no-referrer'}
          width={`min(${size.width}px, 100%)`}
          ref={imgRef}
          style={{
            width: '100%',
            height: 'auto',
            position: 'relative',
            zIndex: 99,
            outline: selected ? '2px solid #1890ff' : 'none',
            boxShadow: selected ? '0 0 0 2px #1890ff' : 'none',
            minHeight: 20,
            display: loading ? 'none' : 'block',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none',
          }}
          {...props}
        />
      </Rnd>
    </div>
  );
};

export function Media({
  element,
  attributes,
  children,
}: ElementProps<MediaNode>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, path] = useSelStatus(element);
  const { markdownEditorRef, readonly } = useEditorStore();
  const { locale } = useContext(I18nContext);
  const htmlRef = React.useRef<HTMLDivElement>(null);
  const [showAsText, setShowAsText] = useState(false);

  const [state, setState] = useGetSetState({
    height: element.height,
    dragging: false,
    loadSuccess: true,
    url: '',
    selected: false,
    type: getMediaType(element?.url, element.alt),
  });
  const updateElement = useRefFunction((attr: Record<string, any>) => {
    if (!markdownEditorRef.current) return;
    Transforms.setNodes(markdownEditorRef.current, attr, { at: path });
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
    const finalType = ['image', 'video', 'autio', 'attachment'].includes(type!)
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
    if (!element.mediaType) {
      updateElement({
        mediaType: state().type,
      });
    }
  });

  useLayoutEffect(() => {
    initial();
  }, [element?.url]);

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

    return !readonly ? (
      <ResizeImage
        defaultSize={{
          width: element.width,
          height: element.height,
        }}
        selected={state().selected}
        src={state()?.url}
        onResizeStart={() => {
          setState({ selected: true });
        }}
        onResizeStop={(size) => {
          Transforms.setNodes(markdownEditorRef.current, size, { at: path });
          setState({ selected: false });
        }}
      />
    ) : (
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
    readonly,
    state().selected,
    element.finished,
    showAsText,
    (element as any)?.rawMarkdown,
  ]);

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
                flex: 1,
                minWidth: 0,
              }}
            >
              <a
                href={state()?.url}
                style={{
                  overflow: 'ellipsis',
                  textOverflow: 'ellipsis',
                  textWrap: 'nowrap',
                  textDecoration: 'none',
                  display: 'block',
                  color: '#262626',
                }}
                download={
                  element.alt?.replace('attachment:', '') || 'attachment'
                }
              >
                {element.alt?.replace('attachment:', '') || 'attachment'}
              </a>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {element.otherProps?.collaborators ? (
                  <div>
                    <AvatarList
                      displayList={
                        element.otherProps?.collaborators
                          ?.map((item: { [key: string]: number }) => {
                            return {
                              name: Object.keys(item)?.at(0) as string,
                              collaboratorNumber:
                                Object.values(item)?.at(0) || 0,
                            };
                          })
                          .slice(0, 5) || []
                      }
                    />
                  </div>
                ) : (
                  <div />
                )}
                {element.otherProps?.updateTime ? (
                  <div
                    style={{
                      color: 'rgba(0,0,0,0.45)',
                      fontSize: 12,
                    }}
                  >
                    {element.otherProps.updateTime}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div
            data-icon-box
            style={{
              padding: '0 18px',
            }}
          >
            <EyeOutlined
              onClick={() => {
                if (typeof window === 'undefined') return;
                window.open(state()?.url);
              }}
              style={{
                fontSize: 16,
                cursor: 'pointer',
              }}
            />
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
  ]);

  return (
    <div {...attributes}>
      <div
        data-be="media"
        data-drag-el
        data-testid="media-container"
        style={{
          cursor: 'pointer',
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
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Popover
          arrow={false}
          styles={{
            body: {
              padding: 8,
            },
          }}
          trigger="click"
          open={state().selected && !readonly ? undefined : false}
          content={
            <ActionIconBox
              title={locale?.delete || '删除'}
              type="danger"
              onClick={(e) => {
                e.stopPropagation();
                Modal.confirm({
                  title: locale?.deleteMedia || '删除媒体',
                  content: locale?.confirmDelete || '确定删除该媒体吗？',
                  onOk: () => {
                    Transforms.removeNodes(markdownEditorRef.current, {
                      at: path,
                    });
                  },
                });
              }}
            >
              <DeleteFilled />
            </ActionIconBox>
          }
        >
          <div
            onClick={() => {
              setTimeout(() => {
                setState({ selected: true });
              }, 16);
            }}
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
            ref={htmlRef}
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
        </Popover>
      </div>
    </div>
  );
}
