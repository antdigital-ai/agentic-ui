import { FileFailed, FileUploadingSpin, X } from '@sofa-design/icons';
import { Tooltip } from 'antd';
import classNames from 'clsx';
import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import { I18nContext } from '../../../I18n';
import { AttachmentFile } from '../types';
import { kbToSize } from '../utils';
import { AttachmentFileIcon } from './AttachmentFileIcon';

type FileStatus = 'uploading' | 'error' | 'done';

interface FileListItemProps {
  file: AttachmentFile;
  onDelete: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onRetry?: () => void;
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

const buildClassName = (...classes: (string | undefined)[]) => {
  return classNames(...classes);
};

const FileIcon: React.FC<{
  file: AttachmentFile;
  prefixCls?: string;
  hashId?: string;
}> = ({ file, prefixCls, hashId }) => {
  const status = file.status || 'done';
  const iconMap: Record<FileStatus, React.ReactNode> = {
    uploading: (
      <div className={buildClassName(`${prefixCls}-uploading-icon`, hashId)}>
        <FileUploadingSpin />
      </div>
    ),
    error: (
      <div className={buildClassName(`${prefixCls}-error-icon`, hashId)}>
        <FileFailed />
      </div>
    ),
    done: (
      <AttachmentFileIcon
        file={file}
        className={buildClassName(`${prefixCls}-file-icon-img`, hashId)}
      />
    ),
  };

  return (
    <div className={buildClassName(`${prefixCls}-file-icon`, hashId)}>
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
  const status = file.status || 'done';
  const baseClassName = buildClassName(`${prefixCls}-file-size`, hashId);

  const statusContentMap: Record<FileStatus, React.ReactNode> = {
    uploading: locale?.uploading || '上传中...',
    error: (
      <div
        className={buildClassName(
          baseClassName,
          `${prefixCls}-file-size-error`,
        )}
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
          className={buildClassName(`${prefixCls}-file-size-item`, hashId)}
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
      className={buildClassName(`${prefixCls}-close-icon`, hashId)}
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
  const canDelete = file.status !== 'uploading';

  const handleFileClick = () => {
    if (!isDoneStatus) return;
    onPreview?.();
  };

  const handleRetryClick = () => {
    if (!isErrorStatus) return;
    onRetry?.();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <Tooltip title={locale?.clickToRetry || '点击重试'} open={isErrorStatus ? undefined : false}>
      <motion.div
        variants={ANIMATION_VARIANTS}
        onClick={handleFileClick}
        className={className}
        exit={ANIMATION_VARIANTS.exit}
      >
        <FileIcon file={file} prefixCls={prefixCls} hashId={hashId} />
        <div className={buildClassName(`${prefixCls}-file-info`, hashId)}>
          <div
            onClick={handleRetryClick}
            className={buildClassName(`${prefixCls}-file-name`, hashId)}
          >
            <span
              className={buildClassName(`${prefixCls}-file-name-text`, hashId)}
            >
              {getFileNameWithoutExtension(file.name)}
            </span>
          </div>
          <FileSizeInfo file={file} prefixCls={prefixCls} hashId={hashId} locale={locale} />
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
