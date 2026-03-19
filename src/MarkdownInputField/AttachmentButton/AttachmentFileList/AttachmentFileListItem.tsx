import { FileFailed, FileUploadingSpin, X } from '@sofa-design/icons';
import { Tooltip } from 'antd';
import classNames from 'clsx';
import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import { I18nContext } from '../../../I18n';
import { AttachmentFile } from '../types';
import {
  isAttachmentFileLoading,
  isFileMetaPlaceholderState,
  kbToSize,
} from '../utils';
import { AttachmentFileIcon, FileMetaPlaceholder } from './AttachmentFileIcon';

type FileStatus = 'uploading' | 'pending' | 'error' | 'done';

interface FileListItemProps {
  file: AttachmentFile;
  onDelete: (file: AttachmentFile) => void;
  onPreview?: (file: AttachmentFile) => void;
  onDownload?: (file: AttachmentFile) => void;
  onRetry?: (file: AttachmentFile) => void;
  className?: string;
  prefixCls?: string;
  hashId?: string;
}

const getFileNameWithoutExtension = (fileName: string) => {
  return fileName.split('.').slice(0, -1).join('.');
};

const getFileExtension = (fileName: string) => {
  return fileName.split('.').slice(-1)[0];
};

const FileIcon: React.FC<{
  file: AttachmentFile;
  prefixCls?: string;
  hashId?: string;
}> = ({ file, prefixCls, hashId }) => {
  const status = ((file.status || 'done') === 'pending'
    ? 'uploading'
    : file.status || 'done') as Exclude<FileStatus, 'pending'>;
  const iconMap: Record<Exclude<FileStatus, 'pending'>, React.ReactNode> = {
    uploading: (
      <div className={classNames(`${prefixCls}-uploading-icon`, hashId)}>
        <FileUploadingSpin />
      </div>
    ),
    error: (
      <div className={classNames(`${prefixCls}-error-icon`, hashId)}>
        <FileFailed />
      </div>
    ),
    done: (
      <AttachmentFileIcon
        file={file}
        className={classNames(`${prefixCls}-file-icon-img`, hashId)}
      />
    ),
  };

  return (
    <div className={classNames(`${prefixCls}-file-icon`, hashId)}>
      {iconMap[status]}
    </div>
  );
};

const FileSizeInfo: React.FC<{
  file: AttachmentFile;
  prefixCls?: string;
  hashId?: string;
  locale?: typeof import('../../../I18n').cnLabels;
}> = ({ file, prefixCls, hashId, locale }) => {
  const status = (file.status || 'done') as FileStatus;
  const baseClassName = classNames(`${prefixCls}-file-size`, hashId);

  const statusContentMap: Record<FileStatus, React.ReactNode> = {
    uploading: locale?.uploading || '上传中...',
    pending: locale?.uploading || '上传中...',
    error: (
      <div
        className={classNames(baseClassName, `${prefixCls}-file-size-error`)}
      >
        {locale?.uploadFailed || '上传失败'}
      </div>
    ),
    done: (() => {
      const fileExtension = getFileExtension(file.name);
      const fileSize = file.size ? kbToSize(file.size / 1024) : '';
      const sizeItems = [fileExtension, fileSize].filter(Boolean);

      return sizeItems.map((item) => (
        <span
          key={item}
          className={classNames(`${prefixCls}-file-size-item`, hashId)}
        >
          {item}
        </span>
      ));
    })(),
  };

  const content = statusContentMap[status];

  return typeof content === 'string' ? (
    <div className={baseClassName}>{content}</div>
  ) : (
    <div className={baseClassName}>{content}</div>
  );
};

const DeleteButton: React.FC<{
  isVisible: boolean;
  onClick: (e: React.MouseEvent) => void;
  prefixCls?: string;
  hashId?: string;
}> = ({ isVisible, onClick, prefixCls, hashId }) => {
  if (!isVisible) return null;

  return (
    <div
      onClick={onClick}
      className={classNames(`${prefixCls}-close-icon`, hashId)}
    >
      <X role="img" aria-label="X" />
    </div>
  );
};

const ANIMATION_VARIANTS = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { opacity: 0, y: -20 },
};

export const AttachmentFileListItem: React.FC<FileListItemProps> = ({
  file,
  prefixCls,
  hashId,
  onPreview,
  onRetry,
  onDelete,
  className,
}) => {
  const { locale } = useContext(I18nContext);
  const isErrorStatus = file.status === 'error';
  const isDoneStatus = file.status === 'done';
  const canDelete = !isAttachmentFileLoading(file.status);

  const handleFileClick = () => {
    if (!isDoneStatus) return;
    onPreview?.(file);
  };

  const handleRetryClick = () => {
    if (!isErrorStatus) return;
    onRetry?.(file);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(file);
  };

  // 有 status 但无 url/previewUrl：文件内容未拿到，展示大小与格式占位块
  if (isFileMetaPlaceholderState(file)) {
    return <FileMetaPlaceholder file={file} className={className} />;
  }

  return (
    <Tooltip
      title={locale?.clickToRetry || '点击重试'}
      open={isErrorStatus ? undefined : false}
    >
      <motion.div
        variants={ANIMATION_VARIANTS}
        onClick={handleFileClick}
        className={classNames(className, {
          [`${prefixCls}-meta-placeholder`]: isFileMetaPlaceholderState(file),
        })}
        data-testid="file-item"
        exit={ANIMATION_VARIANTS.exit}
      >
        <FileIcon file={file} prefixCls={prefixCls} hashId={hashId} />
        <div className={classNames(`${prefixCls}-file-info`, hashId)}>
          <div
            onClick={handleRetryClick}
            className={classNames(`${prefixCls}-file-name`, hashId)}
          >
            <span className={classNames(`${prefixCls}-file-name-text`, hashId)}>
              {getFileNameWithoutExtension(file.name)}
            </span>
          </div>
          <FileSizeInfo
            file={file}
            prefixCls={prefixCls}
            hashId={hashId}
            locale={locale}
          />
        </div>
        <DeleteButton
          isVisible={canDelete}
          onClick={handleDeleteClick}
          prefixCls={prefixCls}
          hashId={hashId}
        />
      </motion.div>
    </Tooltip>
  );
};
