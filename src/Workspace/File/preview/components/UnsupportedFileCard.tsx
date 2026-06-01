import { Download as DownloadIcon } from '@sofa-design/icons';
import { Button, Typography } from 'antd';
import classNames from 'clsx';
import React, { type FC } from 'react';
import type { FileNode } from '../../../types';
import { formatFileSize, formatLastModified } from '../../../utils';
import { fileTypeProcessor } from '../../FileTypeProcessor';
import { getFileTypeIcon } from '../../utils';
import { PlaceholderContent } from './PlaceholderContent';

export interface UnsupportedFileCardProps {
  file: FileNode;
  /** 是否允许显示下载按钮（受 file.canDownload 与外部 onDownload 控制） */
  canDownload: boolean;
  onDownload?: () => void;
  /** 文件区前缀（`workspace-file`），用于复用 FileItem 视觉 */
  filePrefixCls: string;
  /** 预览区前缀（`workspace-file-preview`） */
  prefixCls: string;
  hashId: string;
  locale?: Record<string, any>;
}

/**
 * 「无法预览」卡片
 *
 * 复用 `${filePrefixCls}-item-*` 的视觉 token，与列表页文件卡保持一致；
 * 当存在下载源时展示「下载」按钮，否则仅展示提示文案。
 */
export const UnsupportedFileCard: FC<UnsupportedFileCardProps> = ({
  file,
  canDownload,
  onDownload,
  filePrefixCls,
  prefixCls,
  hashId,
  locale,
}) => {
  const typeInfo = fileTypeProcessor.inferFileType(file);
  const showDownload = canDownload && Boolean(onDownload);

  return (
    <PlaceholderContent prefixCls={prefixCls} hashId={hashId}>
      <div className={classNames(`${prefixCls}-unsupported`, hashId)}>
        <div
          className={classNames(
            `${filePrefixCls}-item`,
            `${prefixCls}-unsupported-item`,
            hashId,
          )}
        >
          <div className={classNames(`${filePrefixCls}-item-icon`, hashId)}>
            {getFileTypeIcon(typeInfo.fileType, file.icon, file.name)}
          </div>
          <div
            className={classNames(`${filePrefixCls}-item-info`, hashId)}
            style={{ textAlign: 'left' }}
          >
            <div className={classNames(`${filePrefixCls}-item-name`, hashId)}>
              <Typography.Text
                ellipsis={{ tooltip: file.name }}
                style={{ font: 'var(--font-text-h6-base)' }}
              >
                {file.name}
              </Typography.Text>
            </div>
            {(typeInfo.displayType || file.size || file.lastModified) && (
              <div
                className={classNames(`${filePrefixCls}-item-details`, hashId)}
              >
                <Typography.Text type="secondary" ellipsis>
                  {typeInfo.displayType && (
                    <span
                      className={classNames(
                        `${filePrefixCls}-item-type`,
                        hashId,
                      )}
                    >
                      {typeInfo.displayType}
                    </span>
                  )}
                  {file.size && (
                    <>
                      {typeInfo.displayType && (
                        <span
                          className={classNames(
                            `${filePrefixCls}-item-separator`,
                            hashId,
                          )}
                        >
                          |
                        </span>
                      )}
                      <span
                        className={classNames(
                          `${filePrefixCls}-item-size`,
                          hashId,
                        )}
                      >
                        {formatFileSize(file.size as number)}
                      </span>
                    </>
                  )}
                  {file.lastModified && (
                    <>
                      {(typeInfo.displayType || file.size) && (
                        <span
                          className={classNames(
                            `${filePrefixCls}-item-separator`,
                            hashId,
                          )}
                        >
                          |
                        </span>
                      )}
                      <span
                        className={classNames(
                          `${filePrefixCls}-item-time`,
                          hashId,
                        )}
                      >
                        {formatLastModified(
                          file.lastModified as string | number | Date,
                        )}
                      </span>
                    </>
                  )}
                </Typography.Text>
              </div>
            )}
          </div>
        </div>
        {showDownload ? (
          <>
            <div
              className={classNames(`${prefixCls}-unsupported-text`, hashId)}
            >
              {locale?.['workspace.file.unsupportedPreview'] ||
                '此文件无法预览，请下载查看。'}
            </div>
            <Button
              color="default"
              variant="solid"
              icon={<DownloadIcon />}
              onClick={onDownload}
              aria-label={locale?.['workspace.file.download'] || '下载'}
            >
              {locale?.['workspace.file.downloadButton'] || '下载'}
            </Button>
          </>
        ) : (
          <div className={classNames(`${prefixCls}-unsupported-text`, hashId)}>
            {locale?.['workspace.file.unsupportedPreviewNoDownload'] ||
              '此文件无法预览。'}
          </div>
        )}
      </div>
    </PlaceholderContent>
  );
};
