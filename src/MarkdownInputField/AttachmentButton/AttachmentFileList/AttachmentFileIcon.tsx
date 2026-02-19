import { Eye, FileFailed, FileUploadingSpin, Play } from '@sofa-design/icons';
import { Image } from 'antd';
import React, { useEffect, useState } from 'react';
import { getFileTypeIcon } from '../../../Workspace/File/utils';
import { FileType } from '../../../Workspace/types';
import { AttachmentFile } from '../types';
import { isImageFile, isVideoFile } from '../utils';

const VideoThumbnail: React.FC<{
  src: string;
  className: string;
  style: React.CSSProperties;
}> = ({ src, className, style }) => (
  <div
    className={className}
    style={{
      ...style,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-base)',
      flexShrink: 0,
    }}
  >
    <video
      src={src}
      preload="metadata"
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.35)',
        pointerEvents: 'none',
      }}
    >
      <Play style={{ width: 24, height: 24, color: '#fff' }} />
    </div>
  </div>
);

/**
 * 从 File 创建并使用 object URL 的视频缩略图，避免每次渲染都创建新 URL
 */
const VideoThumbnailFromBlob: React.FC<{
  file: File;
  className: string;
  style: React.CSSProperties;
}> = ({ file, className, style }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(() => null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!objectUrl) return null;

  return <VideoThumbnail src={objectUrl} className={className} style={style} />;
};

/**
 * AttachmentFileIcon 组件 - 附件文件图标组件
 *
 * 该组件根据文件类型显示不同的图标或预览。如果是图片文件，则显示图片预览；
 * 如果是其他类型文件，则显示对应的文件图标。
 *
 * @component
 * @description 附件文件图标组件，根据文件类型显示图标或预览
 * @param {Object} props - 组件属性
 * @param {AttachmentFile} props.file - 附件文件对象
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 *
 * @example
 * ```tsx
 * <AttachmentFileIcon
 *   file={fileData}
 *   className="custom-icon"
 *   style={{ fontSize: '24px' }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的文件图标或预览组件
 *
 * @remarks
 * - 支持图片文件预览显示
 * - 支持多种文件类型图标
 * - 自动识别文件类型
 * - 提供自定义样式支持
 * - 响应式布局
 * - 图片自适应显示
 * - 图标居中显示
 */
const IMAGE_STYLE: React.CSSProperties = {
  width: '40px',
  height: '40px',
  overflow: 'hidden',
};

const IMAGE_PREVIEW_CONFIG = {
  mask: (
    <div>
      <Eye />
    </div>
  ),
  visible: false,
};

export const AttachmentFileIcon: React.FC<{
  file: AttachmentFile;
  className: string;
  style?: React.CSSProperties;
}> = (props) => {
  const { file, className } = props;

  // 上传中状态
  if (file.status === 'uploading') {
    return <FileUploadingSpin />;
  }

  // 错误状态
  if (file.status === 'error') {
    return <FileFailed />;
  }

  // 图片文件预览
  if (isImageFile(file)) {
    return (
      <Image
        src={file.url}
        style={IMAGE_STYLE}
        rootClassName={className}
        preview={IMAGE_PREVIEW_CONFIG}
        alt={file.name}
      />
    );
  }

  // 视频文件缩略图预览（与图片类似，带播放按钮）
  if (isVideoFile(file)) {
    const videoUrl = file.previewUrl || file.url;
    if (videoUrl) {
      return (
        <VideoThumbnail
          src={videoUrl}
          className={className}
          style={IMAGE_STYLE}
        />
      );
    }
    if (file.size) {
      return (
        <VideoThumbnailFromBlob
          key={`${file.name}-${file.size}-${file.lastModified || 0}`}
          file={file}
          className={className}
          style={IMAGE_STYLE}
        />
      );
    }
  }

  // 其他类型文件图标
  const fileType = file.type?.split('/').at(-1) as FileType;
  return getFileTypeIcon(fileType, '', file.name);
};
