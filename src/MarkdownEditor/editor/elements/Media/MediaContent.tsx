import { EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  shouldRenderUrlAsPlainText,
  UNSAFE_URL_PLAIN_TEXT_STYLE,
} from '../../../../Utils/htmlUrlSafety';
import { MediaNode } from '../../../el';
import { AvatarList } from '../../components/ContributorAvatar';
import { MediaErrorLink } from '../../components/MediaErrorLink';
import { getMediaType } from '../../utils/dom';
import { ReadonlyImage, ResizeImage } from '../Image';

export const resolveMediaType = (element: MediaNode) => {
  const type = ['image', 'video', 'audio', 'attachment'].includes(
    element.mediaType || '',
  )
    ? element.mediaType!
    : getMediaType(element.url, element.alt) || 'image';
  return ['image', 'video', 'audio', 'attachment'].includes(type)
    ? type
    : 'other';
};

interface MediaContentProps {
  element: MediaNode;
  readonly?: boolean;
  selected?: boolean;
  onResizeStop?: (size: {
    width: number | string;
    height: number | string;
  }) => void;
}

const MediaPlayer = React.memo(function MediaPlayer({
  element,
  type,
  readonly,
}: {
  element: MediaNode;
  type: 'video' | 'audio';
  readonly?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const label =
    element.alt || element.url || (type === 'audio' ? '音频链接' : '视频链接');
  if (failed || !element.url) {
    return <MediaErrorLink url={element.url} displayText={label} />;
  }
  const playerProps = {
    src: element.url,
    controls: element.controls !== false,
    autoPlay: element.autoplay,
    loop: element.loop,
    muted: element.muted,
    // A history view can contain many players. Defer their network work until
    // playback; explicit autoplay and the editing preview retain eager metadata.
    preload:
      readonly && !element.autoplay ? ('none' as const) : ('metadata' as const),
    onError: () => setFailed(true),
    style: {
      width: element.width ? `${element.width}px` : '100%',
      height: element.height ? `${element.height}px` : 'auto',
      maxWidth: '100%',
      display: 'block',
      ...(type === 'video'
        ? { borderRadius: 6, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }
        : {}),
    },
  };
  return type === 'video' ? (
    <video
      data-testid="video-element"
      {...playerProps}
      poster={element.poster}
    />
  ) : (
    <audio data-testid="audio-element" {...playerProps} />
  );
});

/** The mounted player is the only loader; selection changes retain its DOM. */
export const MediaContent = React.memo(function MediaContent({
  element,
  readonly,
  selected,
  onResizeStop,
}: MediaContentProps) {
  const type = resolveMediaType(element);
  const source = `${type}\0${element.url || ''}`;
  const [showAsText, setShowAsText] = useState(false);

  useEffect(() => {
    setShowAsText(false);
    if (element.finished !== false) return;
    const timeout = setTimeout(() => setShowAsText(true), 5000);
    return () => clearTimeout(timeout);
  }, [element.finished, element.url]);

  if (element.url && shouldRenderUrlAsPlainText(element.url)) {
    return (
      <span
        data-testid="media-unsafe-url-plain-text"
        style={UNSAFE_URL_PLAIN_TEXT_STYLE}
      >
        {element.url}
      </span>
    );
  }

  if (element.finished === false) {
    const label =
      element.alt ||
      element.url ||
      (type === 'audio'
        ? '音频链接'
        : type === 'video'
          ? '视频链接'
          : '图片链接');
    if (showAsText)
      return (
        <div
          style={{
            padding: '8px 12px',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            color: 'rgba(0, 0, 0, 0.65)',
            overflowWrap: 'anywhere',
          }}
        >
          {label}
        </div>
      );
    if (type !== 'audio') return <Skeleton.Image active />;
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          border: '1px dashed #d9d9d9',
          borderRadius: 6,
          backgroundColor: '#fafafa',
          minWidth: 200,
          justifyContent: 'center',
        }}
      >
        <LoadingOutlined style={{ color: '#1890ff', fontSize: 16 }} spin />
        <span style={{ color: '#666', fontSize: 13, wordBreak: 'break-all' }}>
          {(element as MediaNode & { rawMarkdown?: string }).rawMarkdown ||
            element.otherProps?.rawMarkdown ||
            element.alt ||
            '音频加载中...'}
        </span>
      </div>
    );
  }

  if (type === 'image' || type === 'other') {
    if (readonly) {
      return (
        <ReadonlyImage
          src={element.url}
          alt={element.alt || 'image'}
          width={element.width}
          height={element.height}
        />
      );
    }
    return (
      <ResizeImage
        key={source}
        src={element.url}
        alt={element.alt || 'image'}
        defaultSize={{ width: element.width, height: element.height }}
        selected={selected}
        onResizeStop={onResizeStop}
      />
    );
  }

  if (type === 'video' || type === 'audio') {
    return (
      <MediaPlayer
        key={source}
        element={element}
        type={type}
        readonly={readonly}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #f0f0f0',
        borderRadius: '0.5em',
        backgroundImage:
          'linear-gradient(rgb(249, 251, 255) 0%, rgb(243, 248, 255) 100%)',
        color: '#262626',
        justifyContent: 'space-between',
      }}
    >
      {readonly && (
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
      )}
      <div style={{ flex: 1, minWidth: 0, fontSize: 16 }}>
        <a
          href={element.url}
          download={element.alt?.replace('attachment:', '') || 'attachment'}
          style={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textDecoration: 'none',
            display: 'block',
            color: '#262626',
          }}
        >
          {readonly
            ? element.alt || element.url || '附件'
            : element.alt?.replace('attachment:', '') || 'attachment'}
        </a>
        {element.otherProps?.collaborators && (
          <AvatarList
            displayList={element.otherProps.collaborators
              .map((item: Record<string, number>) => ({
                name: Object.keys(item)[0],
                collaboratorNumber: Object.values(item)[0] || 0,
              }))
              .slice(0, 5)}
          />
        )}
        {element.otherProps?.updateTime && (
          <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
            {element.otherProps.updateTime}
          </div>
        )}
      </div>
      <div data-icon-box style={{ padding: '0 18px' }}>
        <a
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="查看"
          style={{ fontSize: 16, cursor: 'pointer', color: '#1677ff' }}
        >
          {readonly ? '查看' : <EyeOutlined />}
        </a>
      </div>
    </div>
  );
});
