import { Image } from 'antd';
import classNames from 'clsx';
import React, { type FC } from 'react';
import type { FileNode } from '../../../types';
import { PlaceholderContent } from './PlaceholderContent';

export type MediaCategory = 'image' | 'video' | 'audio' | 'pdf';

export interface MediaPreviewProps {
  category: MediaCategory;
  file: FileNode;
  /** 来自 dataSource.previewUrl，若缺失则展示错误占位 */
  previewUrl?: string;
  prefixCls: string;
  hashId: string;
  locale?: Record<string, any>;
}

const getPreviewErrorMessage = (
  category: MediaCategory,
  locale?: Record<string, any>,
): string => {
  const messages: Record<MediaCategory, string> = {
    image:
      locale?.['workspace.file.cannotGetImagePreview'] || '无法获取图片预览',
    video:
      locale?.['workspace.file.cannotGetVideoPreview'] || '无法获取视频预览',
    audio:
      locale?.['workspace.file.cannotGetAudioPreview'] || '无法获取音频预览',
    pdf: locale?.['workspace.file.cannotGetPdfPreview'] || '无法获取PDF预览',
  };
  return messages[category];
};

/**
 * 媒体预览（图片 / 视频 / 音频 / PDF）
 *
 * - video / audio 默认禁用下载控件（`controlsList="nodownload"`）
 * - 视频补一条空 captions 轨道以满足 a11y
 */
export const MediaPreview: FC<MediaPreviewProps> = ({
  category,
  file,
  previewUrl,
  prefixCls,
  hashId,
  locale,
}) => {
  if (!previewUrl) {
    return (
      <PlaceholderContent locale={locale} prefixCls={prefixCls} hashId={hashId}>
        <p>{getPreviewErrorMessage(category, locale)}</p>
      </PlaceholderContent>
    );
  }

  if (category === 'image') {
    return (
      <div className={classNames(`${prefixCls}-image`, hashId)}>
        <Image src={previewUrl} alt={file.name} />
      </div>
    );
  }

  if (category === 'video') {
    return (
      <video
        className={classNames(`${prefixCls}-video`, hashId)}
        src={previewUrl}
        controls
        controlsList="nodownload"
        preload="metadata"
      >
        <track kind="captions" />
        {locale?.['workspace.file.videoNotSupported'] ||
          '您的浏览器不支持视频播放'}
      </video>
    );
  }

  if (category === 'audio') {
    return (
      <audio
        className={classNames(`${prefixCls}-audio`, hashId)}
        src={previewUrl}
        controls
        controlsList="nodownload"
        preload="metadata"
      >
        {locale?.['workspace.file.audioNotSupported'] ||
          '您的浏览器不支持音频播放'}
      </audio>
    );
  }

  // pdf
  return (
    <embed
      className={classNames(`${prefixCls}-pdf`, hashId)}
      src={previewUrl}
      type="application/pdf"
      width="100%"
      height="100%"
    />
  );
};
