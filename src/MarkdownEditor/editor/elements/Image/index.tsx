import {
  BlockOutlined,
  DeleteFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { Image, ImageProps, Modal, Popover, Skeleton, Space } from 'antd';
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Rnd } from 'react-rnd';
import { Editor, Node, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ActionIconBox } from '../../../../Components/ActionIconBox';
import { useRefFunction } from '../../../../Hooks/useRefFunction';
import { I18nContext } from '../../../../I18n';
import { ElementProps, MediaNode } from '../../../el';
import { useElementSelected } from '../../../hooks/editor';
import { MediaErrorLink } from '../../components/MediaErrorLink';
import { deleteMediaAtPath } from '../../plugins/cardPluginBehavior';
import { useEditorStore } from '../../store';

interface ReadonlyImageProps {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
}

function useImageSource(src?: string) {
  const source = useMemo(() => ({ src }), [src]);
  const currentSource = useRef<typeof source | null>(null);
  useLayoutEffect(() => {
    currentSource.current = source;
    return () => {
      currentSource.current = null;
    };
  }, [source]);
  return { source, currentSource };
}

/** A single displayed image owns loading failures; replacing its URL retries. */
export const ReadonlyImage: React.FC<ReadonlyImageProps> = React.memo(
  ({ src, alt, width, height, crossOrigin }) => {
    const { editorProps } = useEditorStore();
    const { source, currentSource } = useImageSource(src);
    const [failedSource, setFailedSource] = useState<typeof source | null>(
      null,
    );

    if (failedSource === source) {
      return (
        <MediaErrorLink url={src} displayText={alt || src || '图片链接'} />
      );
    }

    const imageProps: ImageProps = {
      src,
      alt: alt || 'image',
      width: width ? Number(width) || width : undefined,
      height,
      preview: { getContainer: () => document.body },
      referrerPolicy: 'no-referrer',
      crossOrigin,
      draggable: false,
      loading: 'lazy',
      decoding: 'async',
      style: { maxWidth: '100%', height: 'auto', display: 'block' },
      onError: () => {
        if (currentSource.current === source) setFailedSource(source);
      },
    };
    const image = (
      <Image
        key={src}
        {...imageProps}
        data-testid="image-container"
        data-be="image-container"
      />
    );
    if (editorProps?.image?.render) {
      return editorProps.image.render(imageProps, image);
    }
    return image;
  },
);
ReadonlyImage.displayName = 'ReadonlyImage';

export interface ResizeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onResizeStart?: () => void;
  onResizeStop?: (size: {
    width: number | string;
    height: number | string;
  }) => void;
  defaultSize?: { width?: number | string; height?: number | string };
  /** Only active images mount resize handles; omission preserves the standalone API. */
  selected?: boolean;
}

const positiveDimension = (value: number | string | undefined) => {
  if (typeof value === 'string' && !value.trim()) return undefined;
  const dimension = Number(value);
  return Number.isFinite(dimension) && dimension > 0 ? dimension : undefined;
};

const resizeHandleStyle = { pointerEvents: 'auto' as const };
const resizeHandleStyles = {
  top: resizeHandleStyle,
  right: resizeHandleStyle,
  bottom: resizeHandleStyle,
  left: resizeHandleStyle,
  topRight: resizeHandleStyle,
  bottomRight: resizeHandleStyle,
  bottomLeft: resizeHandleStyle,
  topLeft: resizeHandleStyle,
};
// Ant Design 5 names the panel body; Ant Design 6 names it content.
const imagePopoverStyles = { body: { padding: 8 }, content: { padding: 8 } };

/** Resize locally during dragging, then persist the actual final size once. */
export const ResizeImage = React.memo(
  ({
    onResizeStart,
    onResizeStop,
    selected,
    defaultSize,
    src,
    alt,
    onLoad,
    onError,
    style,
    ...props
  }: ResizeImageProps) => {
    const { source, currentSource } = useImageSource(src);
    const [loadState, setLoadState] = useState({
      source,
      loaded: false,
      error: false,
    });
    const loading = loadState.source !== source || !loadState.loaded;
    const error = loadState.source === source && loadState.error;
    const initialSize = {
      width: positiveDimension(defaultSize?.width) ?? 400,
      height: positiveDimension(defaultSize?.height) ?? 0,
    };
    const [size, setSize] = useState(initialSize);
    const currentSize = useRef(initialSize);
    const ratio = useRef(
      initialSize.height ? initialSize.width / initialSize.height : 1,
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [maxWidth, setMaxWidth] = useState<number>();

    useEffect(() => {
      const nextSize = {
        width: positiveDimension(defaultSize?.width) ?? 400,
        height: positiveDimension(defaultSize?.height) ?? 0,
      };
      currentSize.current = nextSize;
      if (nextSize.height) ratio.current = nextSize.width / nextSize.height;
      setSize((previous) =>
        previous.width === nextSize.width && previous.height === nextSize.height
          ? previous
          : nextSize,
      );
    }, [src, defaultSize?.width, defaultSize?.height]);

    const availableWidth = () =>
      positiveDimension(containerRef.current?.parentElement?.clientWidth);
    const finalSize = (element?: HTMLElement) => {
      const width =
        positiveDimension(element?.clientWidth) ?? currentSize.current.width;
      const height =
        positiveDimension(element?.clientHeight) ??
        (currentSize.current.height ? width / ratio.current : 0);
      return { width, height };
    };

    if (error) {
      return (
        <MediaErrorLink
          url={src}
          displayText={alt || src || '图片链接'}
          style={{ fontSize: '13px', lineHeight: '1.5' }}
        />
      );
    }

    const image = (
      <img
        {...props}
        key={src}
        ref={imageRef}
        src={src}
        alt={alt || 'image'}
        draggable={false}
        referrerPolicy="no-referrer"
        loading={props.loading ?? 'lazy'}
        decoding={props.decoding ?? 'async'}
        width={size.width}
        height={size.height || undefined}
        style={{
          width: '100%',
          height: size.height ? '100%' : 'auto',
          display: 'block',
          visibility: loading ? 'hidden' : undefined,
          minHeight: loading ? 40 : undefined,
          outline: selected ? '2px solid #1890ff' : undefined,
          userSelect: 'none',
          pointerEvents: 'none',
          ...style,
        }}
        onLoad={(event) => {
          if (currentSource.current !== source) return;
          const imageElement = event.currentTarget;
          const requestedWidth = positiveDimension(defaultSize?.width) ?? 400;
          const requestedHeight = positiveDimension(defaultSize?.height);
          if (requestedHeight) {
            ratio.current = requestedWidth / requestedHeight;
          } else if (
            imageElement.naturalWidth > 0 &&
            imageElement.naturalHeight > 0
          ) {
            ratio.current =
              imageElement.naturalWidth / imageElement.naturalHeight;
          }
          const limit = availableWidth();
          setMaxWidth(limit);
          const width = Math.min(requestedWidth, limit ?? Infinity);
          const nextSize = {
            width,
            height: width / ratio.current,
          };
          currentSize.current = nextSize;
          setSize(nextSize);
          setLoadState({ source, loaded: true, error: false });
          onLoad?.(event);
        }}
        onError={(event) => {
          if (currentSource.current !== source) return;
          setLoadState({ source, loaded: false, error: true });
          onError?.(event);
        }}
      />
    );

    return (
      <div
        ref={containerRef}
        data-testid="resize-image-container"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          width: size.width,
          height: size.height || undefined,
          minHeight: loading ? 40 : undefined,
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {loading ? (
          <LoadingOutlined
            style={{ position: 'absolute', fontSize: 16, color: '#1890ff' }}
          />
        ) : null}
        {image}
        {selected !== false ? (
          <Rnd
            size={size}
            position={{ x: 0, y: 0 }}
            disableDragging
            lockAspectRatio={ratio.current}
            minWidth={40}
            minHeight={20}
            maxWidth={maxWidth}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
            resizeHandleStyles={resizeHandleStyles}
            onResizeStart={() => {
              if (currentSource.current !== source) return;
              setMaxWidth(availableWidth());
              onResizeStart?.();
            }}
            onResize={(_event, _direction, element) => {
              if (currentSource.current !== source) return;
              const nextSize = finalSize(element);
              currentSize.current = nextSize;
              if (containerRef.current) {
                containerRef.current.style.width = `${nextSize.width}px`;
                containerRef.current.style.height = `${nextSize.height}px`;
              }
            }}
            onResizeStop={(_event, _direction, element) => {
              if (currentSource.current !== source) return;
              const nextSize = finalSize(element);
              currentSize.current = nextSize;
              setSize(nextSize);
              onResizeStop?.(nextSize);
            }}
          />
        ) : null}
      </div>
    );
  },
);
ResizeImage.displayName = 'ResizeImage';

export function EditorImage({
  element,
  attributes,
  children,
}: ElementProps<MediaNode>) {
  const selected = useElementSelected(element);
  const { markdownEditorRef, readonly } = useEditorStore();
  const mounted = useRef(false);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const { locale } = useContext(I18nContext);
  const [showAsText, setShowAsText] = useState(false);
  const defaultSize = useMemo(
    () => ({ width: element.width, height: element.height }),
    [element.width, element.height],
  );

  const getCurrentPath = useRefFunction(() => {
    if (!mounted.current || readonly) return;
    const editor = markdownEditorRef.current;
    if (!editor) return;
    try {
      const path = ReactEditor.findPath(editor, element);
      if (Node.get(editor, path) === element) return path;
    } catch {
      // The image may have been removed while its confirmation dialog was open.
    }
  });
  const updateSize = useRefFunction(
    (size: { width: number | string; height: number | string }) => {
      const path = getCurrentPath();
      if (path)
        Transforms.setNodes(markdownEditorRef.current, size, { at: path });
    },
  );
  const removeImage = useRefFunction(() => {
    const path = getCurrentPath();
    if (path) deleteMediaAtPath(markdownEditorRef.current, path);
  });

  useEffect(() => {
    setShowAsText(false);
    if (element.finished !== false) return;
    const timer = setTimeout(() => setShowAsText(true), 5000);
    return () => clearTimeout(timer);
  }, [element.finished, element.url]);

  const image =
    element.finished === false ? (
      showAsText ? (
        <div style={{ padding: '8px 12px', wordBreak: 'break-all' }}>
          {element.alt || element.url || '图片链接'}
        </div>
      ) : (
        <Skeleton.Image active />
      )
    ) : (
      <ResizeImage
        key={element.url}
        src={element.url}
        alt={element.alt}
        defaultSize={defaultSize}
        selected={selected}
        onResizeStop={updateSize}
      />
    );

  return (
    <div
      {...attributes}
      data-be="image"
      data-drag-el
      data-testid="image-container"
      style={{
        cursor: 'pointer',
        position: 'relative',
        userSelect: 'none',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
      draggable={false}
      onContextMenu={(event) => event.stopPropagation()}
      onMouseDown={(event) => {
        event.stopPropagation();
        if (event.button !== 0 || selected) return;
        const path = getCurrentPath();
        if (!path) return;
        event.preventDefault();
        Transforms.select(
          markdownEditorRef.current,
          Editor.start(markdownEditorRef.current, path),
        );
        ReactEditor.focus(markdownEditorRef.current);
      }}
      onDragStart={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Popover
        arrow={false}
        destroyOnHidden
        styles={imagePopoverStyles}
        trigger="hover"
        open={selected ? undefined : false}
        content={
          <Space onMouseDown={(event) => event.preventDefault()}>
            <ActionIconBox
              title={locale?.delete || '删除'}
              type="danger"
              onClick={(event) => {
                event.stopPropagation();
                Modal.confirm({
                  title: locale?.deleteMedia || '删除媒体',
                  content: locale?.confirmDelete || '确定删除该媒体吗？',
                  onOk: removeImage,
                });
              }}
            >
              <DeleteFilled />
            </ActionIconBox>
            <ActionIconBox
              title={element.block ? locale?.blockImage : locale?.inlineImage}
              onClick={(event) => {
                event.stopPropagation();
                const path = getCurrentPath();
                if (!path) return;
                const editor = markdownEditorRef.current;
                Editor.withoutNormalizing(editor, () => {
                  Transforms.setNodes(
                    editor,
                    { block: !element.block },
                    { at: path },
                  );
                  const parentPath = Path.parent(path);
                  if (parentPath.length)
                    Transforms.setNodes(
                      editor,
                      { block: !element.block },
                      { at: parentPath },
                    );
                });
              }}
            >
              <BlockOutlined />
            </ActionIconBox>
          </Space>
        }
      >
        <div
          tabIndex={-1}
          style={{
            padding: 4,
            display: 'flex',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
          draggable={false}
          contentEditable={false}
          data-be="media-container"
        >
          {image}
          <div style={{ display: 'none' }}>{children}</div>
        </div>
      </Popover>
    </div>
  );
}
