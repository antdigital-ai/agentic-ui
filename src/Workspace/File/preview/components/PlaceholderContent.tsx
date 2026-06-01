import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { type FC, useContext } from 'react';
import type { FileNode } from '../../../types';

export interface PlaceholderContentProps {
  children?: React.ReactNode;
  /** 是否在占位区显示文件名 / 大小等基础信息 */
  showFileInfo?: boolean;
  file?: FileNode;
  /** 显示「点击下载」按钮的回调 */
  onDownload?: () => void;
  locale?: Record<string, any>;
  /** 外部传入的样式前缀；未传时回退为 ant 默认前缀拼接 workspace-preview */
  prefixCls?: string;
  hashId?: string;
}

/**
 * 预览页通用占位容器：用于加载中、错误、不支持等场景
 *
 * 仅承担布局容器职责，具体的 Spin / Alert / 文案由调用方传入 children
 */
export const PlaceholderContent: FC<PlaceholderContentProps> = ({
  children,
  showFileInfo,
  file,
  onDownload,
  locale,
  prefixCls,
  hashId,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const finalPrefixCls = prefixCls || getPrefixCls('workspace-preview');

  return (
    <div className={classNames(`${finalPrefixCls}-placeholder`, hashId)}>
      <div
        className={classNames(`${finalPrefixCls}-placeholder-content`, hashId)}
      >
        {children}
        {showFileInfo && file && (
          <>
            <p>
              {locale?.['workspace.file.fileName'] || '文件名：'}
              {file.name}
            </p>
            {file.size && (
              <p>
                {locale?.['workspace.file.fileSize'] || '文件大小：'}
                {file.size}
              </p>
            )}
            {onDownload && (
              <button
                type="button"
                className={classNames(
                  `${finalPrefixCls}-download-button`,
                  hashId,
                )}
                onClick={onDownload}
                aria-label={locale?.['workspace.file.download'] || '下载文件'}
              >
                {locale?.['workspace.file.clickToDownload'] || '点击下载'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
