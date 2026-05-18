import {
  Download as DownloadIcon,
  Eye as EyeIcon,
  Locate,
  SquareArrowOutUpRight as ShareIcon,
} from '@sofa-design/icons';
import { Typography } from 'antd';
import classNames from 'clsx';
import React, { memo, type FC } from 'react';

import { ActionIconBox } from '../../../Components/ActionIconBox';
import type { FileNode, FileProps, FileTreeNode } from '../../types';
import {
  shouldShowFileDownloadAction,
  shouldShowFilePreviewAction,
} from '../fileListRowActions';
import {
  ensureNodeWithId,
  handleDefaultShare,
  handleFileDownload,
} from '../handlers';

export interface FileTreeLeafTitleProps {
  node: FileTreeNode & { file: FileNode };
  prefixCls: string;
  hashId: string;
  locale?: Record<string, any>;
  onDownload?: (file: FileNode) => void;
  onPreview?: FileProps['onPreview'];
  onShare?: FileProps['onShare'];
  onLocate?: (file: FileNode) => void;
}

const FileTreeLeafTitleComponent: FC<FileTreeLeafTitleProps> = ({
  node,
  prefixCls,
  hashId,
  locale,
  onDownload,
  onPreview,
  onShare,
  onLocate,
}) => {
  const fileWithId = ensureNodeWithId({
    ...node.file,
    name: node.file.name ?? node.name,
    id: node.file.id ?? node.id ?? node.key,
  });
  const isDisabled = node.disabled === true;

  const showDownloadButton = shouldShowFileDownloadAction(
    fileWithId,
    onDownload,
  );

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(fileWithId);
      return;
    }
    handleFileDownload(fileWithId);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    void onPreview?.(fileWithId);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(fileWithId, {
        anchorEl: e.currentTarget as HTMLElement,
        origin: 'list',
      });
      return;
    }
    handleDefaultShare(fileWithId);
  };

  const showPreviewButton = shouldShowFilePreviewAction(fileWithId, onPreview);

  const showShareButton = fileWithId.canShare === true;
  const showLocationButton = fileWithId.canLocate === true;

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLocate?.(fileWithId);
  };

  const actionBtnClass = classNames(`${prefixCls}-leaf-action-btn`, hashId);

  if (isDisabled) {
    return (
      <span className={classNames(`${prefixCls}-leaf-title-text`, hashId)}>
        {fileWithId.name}
      </span>
    );
  }

  return (
    <div className={classNames(`${prefixCls}-leaf-title`, hashId)}>
      <div className={classNames(`${prefixCls}-leaf-title-text`, hashId)}>
        <Typography.Text>{fileWithId.name}</Typography.Text>
      </div>
      <div
        className={classNames(`${prefixCls}-leaf-actions`, hashId)}
        onClick={(e) => e.stopPropagation()}
      >
        {showPreviewButton ? (
          <ActionIconBox
            key="preview"
            title={locale?.['workspace.file.preview'] || '预览'}
            onClick={handlePreview}
            tooltipProps={{ mouseEnterDelay: 0.3 }}
            className={actionBtnClass}
          >
            <EyeIcon />
          </ActionIconBox>
        ) : null}
        {showLocationButton ? (
          <ActionIconBox
            key="locate"
            title={locale?.['workspace.file.location'] || '定位'}
            onClick={handleLocate}
            tooltipProps={{ mouseEnterDelay: 0.3 }}
            className={actionBtnClass}
          >
            <Locate />
          </ActionIconBox>
        ) : null}
        {showShareButton ? (
          <ActionIconBox
            key="share"
            title={locale?.['workspace.file.share'] || '分享'}
            onClick={handleShare}
            tooltipProps={{ mouseEnterDelay: 0.3 }}
            className={actionBtnClass}
          >
            <ShareIcon />
          </ActionIconBox>
        ) : null}
        {showDownloadButton ? (
          <ActionIconBox
            key="download"
            title={locale?.['workspace.file.download'] || '下载'}
            onClick={handleDownload}
            tooltipProps={{ mouseEnterDelay: 0.3 }}
            className={actionBtnClass}
          >
            <DownloadIcon />
          </ActionIconBox>
        ) : null}
      </div>
    </div>
  );
};

FileTreeLeafTitleComponent.displayName = 'FileTreeLeafTitle';

export const FileTreeLeafTitle = memo(FileTreeLeafTitleComponent);
