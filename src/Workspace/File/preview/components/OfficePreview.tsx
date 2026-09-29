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
  /** Workspace 文件节点（取 file.file / previewUrl / file.url 作为预览源） */
  file: FileNode;
  /** 来自 dataSource.previewUrl；也可回退到 file.url */
  previewUrl?: string;
  /** 组件类名前缀 */
  prefixCls: string;
  /** cssinjs hash 类名 */
  hashId: string;
  /** 国际化文案 */
  locale?: Record<string, any>;
}

/**
 * Workspace 内 Office 文档预览（docx / xlsx / pptx）
 *
 * 懒加载 `OfficeViewer`；源优先级：file.file → previewUrl → file.url
 * 容器通过 `&-office` 撑满预览区，OfficeViewer 高度 100% 自适应
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
  // display name 可能无扩展名：先按 name 推断，失败再回退到预览 URL
  const fileType =
    inferOfficeFileType(file.name) ??
    inferOfficeFileType(previewUrl || file.url);

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
