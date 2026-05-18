import {
  Download as DownloadIcon,
  Eye as EyeIcon,
  Locate,
  SquareArrowOutUpRight as ShareIcon,
} from '@sofa-design/icons';
import { Typography } from 'antd';
import classNames from 'clsx';
import React, { type FC } from 'react';
import { ActionIconBox } from '../../../Components/ActionIconBox';
import type {
  FileBuiltinActions,
  FileNode,
  FileRenderContext,
} from '../../types';
import { formatFileSize, formatLastModified } from '../../utils';
import { fileTypeProcessor } from '../FileTypeProcessor';
import {
  shouldShowFileDownloadAction,
  shouldShowFilePreviewAction,
} from '../fileListRowActions';
import {
  ensureNodeWithId,
  handleDefaultShare,
  handleFileDownload,
} from '../handlers';
import { getFileTypeIcon } from '../utils';
import { AccessibleButton } from './AccessibleButton';

export interface FileItemProps {
  file: FileNode;
  onClick?: (file: FileNode) => void;
  onDownload?: (file: FileNode) => void;
  onPreview?: (file: FileNode) => void;
  onShare?: (
    file: FileNode,
    ctx?: { anchorEl?: HTMLElement; origin: 'list' | 'preview' },
  ) => void;
  onLocate?: (file: FileNode) => void;
  prefixCls: string;
  hashId: string;
  locale?: Record<string, any>;
  /** 是否在元素上绑定 DOM id（默认 false） */
  bindDomId?: boolean;
}

/**
 * 单个文件项
 *
 * 行为约定：
 * - 用户传 `onClick` 时优先触发；否则 fallback 到 `onPreview`
 * - 操作按钮显示：
 *   - 预览：`canPreview` 用户优先；默认对图片要求有 url，其他类型按 fileTypeProcessor 判定
 *   - 下载：`canDownload` 用户优先；默认存在下载源（onDownload/url/content/file）即可
 *   - 分享/定位：默认隐藏，需用户显式 `canShare/canLocate=true`
 * - 禁用态：操作按钮全部隐藏，根容器不响应点击
 */
const FileItemComponent: FC<FileItemProps> = ({
  file,
  onClick,
  onDownload,
  onPreview,
  onShare,
  onLocate,
  prefixCls,
  hashId,
  locale,
  bindDomId = false,
}) => {
  const fileWithId = ensureNodeWithId(file);
  const fileTypeInfo = fileTypeProcessor.inferFileType(fileWithId);
  const isDisabled = fileWithId.disabled === true;

  const handleClick = () => {
    if (isDisabled) return;
    if (onClick) {
      onClick(fileWithId);
      return;
    }
    if (onPreview) {
      onPreview(fileWithId);
    }
  };

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
    onPreview?.(fileWithId);
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

  const actionBtnClass = classNames(`${prefixCls}-item-action-btn`, hashId);

  const builtinActions: FileBuiltinActions = {
    preview: showPreviewButton ? (
      <ActionIconBox
        key="preview"
        title={locale?.['workspace.file.preview'] || '预览'}
        onClick={handlePreview}
        tooltipProps={{ mouseEnterDelay: 0.3 }}
        className={actionBtnClass}
      >
        <EyeIcon />
      </ActionIconBox>
    ) : null,
    locate: showLocationButton ? (
      <ActionIconBox
        key="locate"
        title={locale?.['workspace.file.location'] || '定位'}
        onClick={handleLocate}
        tooltipProps={{ mouseEnterDelay: 0.3 }}
        className={actionBtnClass}
      >
        <Locate />
      </ActionIconBox>
    ) : null,
    share: showShareButton ? (
      <ActionIconBox
        key="share"
        title={locale?.['workspace.file.share'] || '分享'}
        onClick={handleShare}
        tooltipProps={{ mouseEnterDelay: 0.3 }}
        className={actionBtnClass}
      >
        <ShareIcon />
      </ActionIconBox>
    ) : null,
    download: showDownloadButton ? (
      <ActionIconBox
        key="download"
        title={locale?.['workspace.file.download'] || '下载'}
        onClick={handleDownload}
        tooltipProps={{ mouseEnterDelay: 0.3 }}
        className={actionBtnClass}
      >
        <DownloadIcon />
      </ActionIconBox>
    ) : null,
  };

  const renderContext: FileRenderContext = {
    file: fileWithId,
    prefixCls,
    hashId,
    disabled: isDisabled,
    actions: builtinActions,
  };

  const ariaLabel = `${locale?.['workspace.file'] || '文件'}：${fileWithId.name}`;

  return (
    <AccessibleButton
      icon={
        <>
          <div className={classNames(`${prefixCls}-item-icon`, hashId)}>
            {getFileTypeIcon(
              fileTypeInfo.fileType,
              fileWithId.icon,
              fileWithId.name,
            )}
          </div>
          <div className={classNames(`${prefixCls}-item-info`, hashId)}>
            <div className={classNames(`${prefixCls}-item-name`, hashId)}>
              {fileWithId.renderName ? (
                fileWithId.renderName(renderContext)
              ) : (
                <Typography.Text ellipsis={{ tooltip: fileWithId.name }}>
                  {fileWithId.name}
                </Typography.Text>
              )}
            </div>
            {(fileWithId.renderDetails ||
              fileTypeInfo.displayType ||
              fileWithId.size ||
              fileWithId.lastModified) && (
              <div className={classNames(`${prefixCls}-item-details`, hashId)}>
                {fileWithId.renderDetails ? (
                  fileWithId.renderDetails(renderContext)
                ) : (
                  <Typography.Text type="secondary" ellipsis>
                    {fileTypeInfo.displayType && (
                      <span
                        className={classNames(`${prefixCls}-item-type`, hashId)}
                      >
                        {fileTypeInfo.displayType}
                      </span>
                    )}
                    {fileWithId.size && (
                      <>
                        {fileTypeInfo.displayType && (
                          <span
                            className={classNames(
                              `${prefixCls}-item-separator`,
                              hashId,
                            )}
                          >
                            |
                          </span>
                        )}
                        <span
                          className={classNames(
                            `${prefixCls}-item-size`,
                            hashId,
                          )}
                        >
                          {formatFileSize(fileWithId.size)}
                        </span>
                      </>
                    )}
                    {fileWithId.lastModified && (
                      <>
                        {(fileTypeInfo.displayType || fileWithId.size) && (
                          <span
                            className={classNames(
                              `${prefixCls}-item-separator`,
                              hashId,
                            )}
                          >
                            |
                          </span>
                        )}
                        <span
                          className={classNames(
                            `${prefixCls}-item-time`,
                            hashId,
                          )}
                        >
                          {formatLastModified(fileWithId.lastModified)}
                        </span>
                      </>
                    )}
                  </Typography.Text>
                )}
              </div>
            )}
          </div>
          <div
            className={classNames(`${prefixCls}-item-actions`, hashId)}
            onClick={(e) => e.stopPropagation()}
          >
            {fileWithId.renderActions ? (
              fileWithId.renderActions(renderContext)
            ) : !isDisabled ? (
              <>
                {builtinActions.preview}
                {builtinActions.locate}
                {builtinActions.share}
                {builtinActions.download}
              </>
            ) : null}
          </div>
        </>
      }
      onClick={handleClick}
      className={classNames(
        `${prefixCls}-item`,
        { [`${prefixCls}-item-disabled`]: isDisabled },
        hashId,
      )}
      ariaLabel={ariaLabel}
      id={bindDomId ? fileWithId.id : undefined}
    />
  );
};

FileItemComponent.displayName = 'FileItem';

export const FileItem = FileItemComponent;
