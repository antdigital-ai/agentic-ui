import { FileFailed, FileUploadingSpin, X } from '@sofa-design/icons';
import { Tooltip } from 'antd';
import classNames from 'clsx';
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
  onPreview?: (file: AttachmentFile) => void | Promise<void>;
  onDownload?: (file: AttachmentFile) => void;
  onRetry?: (file: AttachmentFile) => void;
  className?: string;
  prefixCls?: string;
  hashId?: string;
  /**
   * 入场/退出动画状态，由父组件 AttachmentFileList 控制：
   * - `enter`：入场播放 slide-in-up
   * - `exit`：退出播放 slide-out-up，动画结束后由父组件真正卸载
   *
   * 等价于 framer-motion 的 AnimatePresence + variants={hidden/visible/exit}。
   */
  motionState?: 'enter' | 'exit';
  /**
   * 入场动画延迟（秒），等价于 framer-motion 父级 `staggerChildren: 0.1 * index`。
   */
  motionDelaySec?: number;
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
  const status = (
    (file.status || 'done') === 'pending' ? 'uploading' : file.status || 'done'
  ) as Exclude<FileStatus, 'pending'>;
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

const DoneFileSizeItems: React.FC<{
  file: AttachmentFile;
  prefixCls?: string;
  hashId?: string;
}> = ({ file, prefixCls, hashId }) => {
  const fileExtension = getFileExtension(file.name);
  const fileSize = file.size ? kbToSize(file.size / 1024) : '';
  const sizeItems = [fileExtension, fileSize].filter(Boolean);

  return (
    <>
      {sizeItems.map((item) => (
        <span
          key={item}
          className={classNames(`${prefixCls}-file-size-item`, hashId)}
        >
          {item}
        </span>
      ))}
    </>
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

  if (status === 'uploading' || status === 'pending') {
    return (
      <div className={baseClassName}>{locale?.uploading || 'Uploading...'}</div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={classNames(baseClassName, `${prefixCls}-file-size-error`)}
      >
        {file.errorMessage || locale?.uploadFailed || 'Upload failed'}
      </div>
    );
  }

  return (
    <div className={baseClassName}>
      <DoneFileSizeItems file={file} prefixCls={prefixCls} hashId={hashId} />
    </div>
  );
};

const DeleteButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  prefixCls?: string;
  hashId?: string;
}> = ({ onClick, prefixCls, hashId }) => (
  <div
    onClick={onClick}
    className={classNames(`${prefixCls}-close-icon`, hashId)}
  >
    <X role="img" aria-label="X" />
  </div>
);

export const AttachmentFileListItem: React.FC<FileListItemProps> = ({
  file,
  prefixCls,
  hashId,
  onPreview,
  onRetry,
  onDelete,
  className,
  motionState = 'enter',
  motionDelaySec = 0,
}) => {
  const { locale } = useContext(I18nContext);
  const isErrorStatus = file.status === 'error';
  const isNonRetryableError =
    isErrorStatus &&
    (file.errorCode === 'FILE_SIZE_EXCEEDED' ||
      file.errorCode === 'FILE_COUNT_EXCEEDED');
  const canRetry = isErrorStatus && !isNonRetryableError;
  const isDoneStatus = file.status === 'done';
  const canDelete = !isAttachmentFileLoading(file.status);

  const handleFileClick = () => {
    if (canRetry) {
      onRetry?.(file);
      return;
    }
    if (!isDoneStatus) return;
    onPreview?.(file);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(file);
  };

  // 有 status 但无 url/previewUrl：文件内容未拿到，展示大小与格式占位块
  // 注意：error 状态不走占位符，直接在下面的 file-item 中展示失败 UI
  if (!isErrorStatus && isFileMetaPlaceholderState(file)) {
    return <FileMetaPlaceholder file={file} className={className} />;
  }

  return (
    <Tooltip
      title={canRetry ? locale?.clickToRetry || '点击重试' : undefined}
      open={canRetry ? undefined : false}
    >
      {/* 入场/退出动画由 CSS 控制（参见 AttachmentFileList/style.ts 的 -item-motion）。
          通过 data-state 切换 enter/exit keyframes，配合父组件维护的"正在退出"
          影子状态 + 延迟卸载，等价于 framer-motion 的 AnimatePresence + variants。
          注意：style 选择器定义在父级 componentCls 上（{prefix}-item-motion），
          这里 props.prefixCls 是 `${parentPrefix}-item`，拼接后类名为
          `${parentPrefix}-item-motion`，与 style.ts 中的选择器一致。 */}
      <div
        onClick={handleFileClick}
        className={classNames(className, `${prefixCls}-motion`, {
          [`${prefixCls}-meta-placeholder`]: isFileMetaPlaceholderState(file),
        })}
        data-testid="file-item"
        data-state={motionState}
        style={
          {
            '--attachment-item-delay': `${motionDelaySec}s`,
          } as React.CSSProperties
        }
      >
        <FileIcon file={file} prefixCls={prefixCls} hashId={hashId} />
        <div className={classNames(`${prefixCls}-file-info`, hashId)}>
          <div className={classNames(`${prefixCls}-file-name`, hashId)}>
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
        {canDelete && (
          <DeleteButton
            onClick={handleDeleteClick}
            prefixCls={prefixCls}
            hashId={hashId}
          />
        )}
      </div>
    </Tooltip>
  );
};
