import { Spin } from 'antd';
import classNames from 'clsx';
import React, { type FC, lazy, Suspense } from 'react';
import { inferOfficeFileType } from '../../../../Components/OfficeViewer';
import type { FileNode } from '../../../types';
import { PlaceholderContent } from './PlaceholderContent';

const LazyOfficeViewer = lazy(() =>
  import('../../../../Components/OfficeViewer').then((m) => ({
    default: m.OfficeViewer,
  })),
);

export interface OfficePreviewProps {
  file: FileNode;
  /** 来自 dataSource.previewUrl；也可回退到 file.url */
  previewUrl?: string;
  prefixCls: string;
  hashId: string;
  locale?: Record<string, any>;
}

/**
 * Workspace 内 Office 文档预览（docx / xlsx / pptx）
 *
 * 懒加载 `OfficeViewer`；源优先级：file.file → previewUrl → file.url
 */
export const OfficePreview: FC<OfficePreviewProps> = ({
  file,
  previewUrl,
  prefixCls,
  hashId,
  locale,
}) => {
  const source: File | Blob | string | undefined =
    file.file || previewUrl || file.url || undefined;
  const fileType = inferOfficeFileType(file.name || previewUrl || file.url);

  if (!source || !fileType) {
    return (
      <PlaceholderContent locale={locale} prefixCls={prefixCls} hashId={hashId}>
        <p>
          {locale?.['workspace.file.cannotGetOfficePreview'] ||
            '无法获取 Office 文档预览'}
        </p>
      </PlaceholderContent>
    );
  }

  return (
    <div className={classNames(`${prefixCls}-office`, hashId)}>
      <Suspense
        fallback={
          <PlaceholderContent
            locale={locale}
            prefixCls={prefixCls}
            hashId={hashId}
          >
            <Spin
              tip={
                locale?.['workspace.file.loadingOffice'] ||
                '正在加载 Office 文档...'
              }
            />
          </PlaceholderContent>
        }
      >
        <LazyOfficeViewer
          file={source}
          fileType={fileType}
          fileName={file.name}
          height="100%"
          style={{ border: 'none', borderRadius: 0, height: '100%' }}
        />
      </Suspense>
    </div>
  );
};
