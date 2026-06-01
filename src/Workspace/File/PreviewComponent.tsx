import { LoadingOutlined } from '@ant-design/icons';
import {
  Download as DownloadIcon,
  ArrowLeft as LeftIcon,
  Locate,
  SquareArrowOutUpRight as ShareIcon,
} from '@sofa-design/icons';
import { Alert, ConfigProvider, Segmented, Spin } from 'antd';
import classNames from 'clsx';
import React, { type FC, useContext, useEffect, useRef, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import {
  MarkdownEditor,
  type MarkdownEditorInstance,
  type MarkdownEditorProps,
} from '../../MarkdownEditor';
import { HtmlPreview } from '../HtmlPreview';
import type { FileNode } from '../types';
import { formatLastModified } from '../utils';
import { fileTypeProcessor } from './FileTypeProcessor';
import { MediaPreview } from './preview/components/MediaPreview';
import { PlaceholderContent } from './preview/components/PlaceholderContent';
import { UnsupportedFileCard } from './preview/components/UnsupportedFileCard';
import { usePreviewContent } from './preview/usePreviewContent';
import { getContentStatus, isHtmlFile } from './preview/utils';
import { useFileStyle } from './style';
import { getFileTypeIcon } from './utils';

const EDITOR_PADDING = '0 12px';

/**
 * PreviewComponent 组件属性
 */
export interface PreviewComponentProps {
  /** 文件数据 */
  file: FileNode;
  /** 自定义预览内容 */
  customContent?: React.ReactNode;
  /** 自定义头部 */
  customHeader?: React.ReactNode;
  /** 自定义操作按钮 */
  customActions?: React.ReactNode;
  /** 返回回调 */
  onBack?: () => void;
  /** 下载回调 */
  onDownload?: (file: FileNode) => void;
  /** 分享回调 */
  onShare?: (
    file: FileNode,
    options?: { anchorEl?: HTMLElement; origin?: string },
  ) => void;
  /** 定位回调 */
  onLocate?: (file: FileNode) => void;
  /** Markdown 编辑器配置 */
  markdownEditorProps?: Partial<
    Omit<MarkdownEditorProps, 'editorRef' | 'initValue' | 'readonly'>
  >;
  /** 头部文件信息覆盖 */
  headerFileOverride?: Partial<FileNode>;
}

/**
 * 文件预览组件
 *
 * 渲染管线：
 * 1. `customContent` 优先 → 自定义节点
 * 2. 文件 `loading` → 流式占位
 * 3. `usePreviewContent` 未就绪 → Spin 占位
 * 4. 内容加载错误 → Alert 占位
 * 5. `canPreview === false` → `UnsupportedFileCard`
 * 6. 文本/代码 → `MarkdownEditor`（HTML 子类型走 `HtmlPreview`，支持 preview/code 切换）
 * 7. 图片/视频/音频/PDF → `MediaPreview`
 * 8. 其它 → 通用占位（含可选下载）
 */
export const PreviewComponent: FC<PreviewComponentProps> = ({
  file,
  customContent,
  customHeader,
  customActions,
  onBack,
  onDownload,
  onShare,
  onLocate,
  markdownEditorProps,
  headerFileOverride,
}) => {
  const { locale } = useContext(I18nContext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const filePrefixCls = getPrefixCls('workspace-file');
  const { hashId } = useFileStyle(filePrefixCls);
  const prefixCls = `${filePrefixCls}-preview`;
  const editorRef = useRef<MarkdownEditorInstance>();

  const { processResult, contentState } = usePreviewContent(
    file,
    customContent,
    locale,
  );

  const [htmlViewMode, setHtmlViewMode] = useState<'preview' | 'code'>(
    'preview',
  );

  const canDownload = file.canDownload !== false;

  const handleDownload = () => {
    if (!canDownload) return;
    onDownload?.(file);
  };

  const handleShare = (e: React.MouseEvent) => {
    onShare?.(file, {
      anchorEl: e.currentTarget as HTMLElement,
      origin: 'preview',
    });
  };

  const handleLocate = () => {
    onLocate?.(file);
  };

  // 内容就绪后注入到 MarkdownEditor store
  useEffect(() => {
    if (customContent) return;
    if (
      editorRef.current?.store &&
      contentState.status === 'ready' &&
      contentState.mdContent
    ) {
      editorRef.current.store.setMDContent(contentState.mdContent);
    }
  }, [contentState, customContent]);

  // 切换文件时重置 HTML 视图模式
  useEffect(() => {
    setHtmlViewMode('preview');
  }, [file.name]);

  const isCurrentFileHtml = isHtmlFile(
    file.name,
    processResult?.dataSource.mimeType,
  );

  const renderTextOrCode = () => {
    if (isCurrentFileHtml) {
      const htmlStatus = getContentStatus(contentState);
      const rawContent =
        contentState.status === 'error' ? '' : contentState.rawContent || '';
      return (
        <div className={classNames(`${prefixCls}-text`, hashId)}>
          <HtmlPreview
            html={rawContent}
            status={htmlStatus}
            viewMode={htmlViewMode}
            onViewModeChange={setHtmlViewMode}
            iframeProps={{ sandbox: 'allow-scripts' }}
            showSegmented={false}
          />
        </div>
      );
    }

    if (contentState.status === 'loading') {
      return (
        <PlaceholderContent prefixCls={prefixCls} hashId={hashId}>
          <Spin
            size="large"
            tip={
              locale?.['workspace.loadingFileContent'] || '正在加载文件内容...'
            }
          >
            <div
              className={classNames(`${prefixCls}-spin-anchor`, hashId)}
              style={{ minHeight: 64, width: '100%' }}
              aria-hidden
            />
          </Spin>
        </PlaceholderContent>
      );
    }

    return (
      <div className={classNames(`${prefixCls}-text`, hashId)}>
        <MarkdownEditor
          editorRef={editorRef}
          initValue=""
          readonly={true}
          contentStyle={{ padding: EDITOR_PADDING }}
          {...markdownEditorProps}
        />
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (file.loading) {
      return (
        <div className={classNames(`${prefixCls}-content-loading`, hashId)}>
          <span
            className={classNames(`${prefixCls}-content-loading-tip`, hashId)}
          >
            <LoadingOutlined />
            {locale?.['workspace.file.generating'] || '正在生成'}
          </span>
          <div
            className={classNames(`${prefixCls}-content-loading-inner`, hashId)}
          >
            {file?.content || '...'}
          </div>
        </div>
      );
    }

    if (customContent) {
      return (
        <div className={classNames(`${prefixCls}-custom-content`, hashId)}>
          {customContent}
        </div>
      );
    }

    if (!processResult) {
      return (
        <PlaceholderContent prefixCls={prefixCls} hashId={hashId}>
          <Spin
            size="large"
            tip={locale?.['workspace.file.processing'] || '正在处理文件...'}
          >
            <div
              className={classNames(`${prefixCls}-spin-anchor`, hashId)}
              style={{ minHeight: 64, width: '100%' }}
              aria-hidden
            />
          </Spin>
        </PlaceholderContent>
      );
    }

    if (contentState.status === 'error') {
      return (
        <PlaceholderContent prefixCls={prefixCls} hashId={hashId}>
          <Alert
            message={locale?.['workspace.file.processFailed'] || '文件处理失败'}
            description={contentState.error}
            type="error"
            showIcon
          />
        </PlaceholderContent>
      );
    }

    const { typeInference, dataSource, canPreview, previewMode } =
      processResult;

    if (!canPreview || previewMode === 'none') {
      return (
        <UnsupportedFileCard
          file={file}
          canDownload={canDownload}
          onDownload={canDownload && onDownload ? handleDownload : undefined}
          filePrefixCls={filePrefixCls}
          prefixCls={prefixCls}
          hashId={hashId}
          locale={locale}
        />
      );
    }

    switch (typeInference.category) {
      case 'text':
      case 'code':
        return renderTextOrCode();

      case 'image':
      case 'video':
      case 'audio':
      case 'pdf':
        return (
          <MediaPreview
            category={typeInference.category}
            file={file}
            previewUrl={dataSource.previewUrl}
            prefixCls={prefixCls}
            hashId={hashId}
            locale={locale}
          />
        );

      default:
        return (
          <PlaceholderContent
            file={file}
            showFileInfo
            onDownload={canDownload && onDownload ? handleDownload : undefined}
            locale={locale}
            prefixCls={prefixCls}
            hashId={hashId}
          >
            <p>
              {locale?.['workspace.file.unknownFileType'] || '未知的文件类型'}
            </p>
            <p>
              {locale?.['workspace.file.fileType'] || '文件类型：'}
              {typeInference.fileType}
            </p>
          </PlaceholderContent>
        );
    }
  };

  const headerFile = headerFileOverride
    ? { ...file, ...headerFileOverride }
    : file;
  const headerFileType = fileTypeProcessor.inferFileType(file).fileType;
  const headerLastModified =
    headerFileOverride?.lastModified ?? file.lastModified;

  return (
    <div className={classNames(prefixCls, hashId)}>
      {customHeader ? (
        <div className={classNames(`${prefixCls}-header`, hashId)}>
          {customHeader}
        </div>
      ) : (
        <div className={classNames(`${prefixCls}-header`, hashId)}>
          {onBack && (
            <button
              type="button"
              className={classNames(`${prefixCls}-back-button`, hashId)}
              onClick={onBack}
              aria-label={
                locale?.['workspace.file.backToFileList'] || '返回文件列表'
              }
            >
              <LeftIcon
                className={classNames(`${prefixCls}-back-icon`, hashId)}
              />
            </button>
          )}

          <div className={classNames(`${prefixCls}-file-info`, hashId)}>
            <div className={classNames(`${prefixCls}-file-title`, hashId)}>
              <span className={classNames(`${prefixCls}-file-icon`, hashId)}>
                {getFileTypeIcon(
                  headerFileType,
                  headerFile.icon,
                  headerFile.name,
                )}
              </span>
              <span className={classNames(`${prefixCls}-file-name`, hashId)}>
                {headerFile.name}
              </span>
            </div>
            {headerLastModified && (
              <div className={classNames(`${prefixCls}-generate-time`, hashId)}>
                {locale?.['workspace.file.generationTime'] || '生成时间：'}
                {formatLastModified(
                  headerLastModified as string | number | Date,
                )}
              </div>
            )}
          </div>

          <div className={classNames(`${prefixCls}-actions`, hashId)}>
            {!customContent && isCurrentFileHtml && (
              <Segmented
                size="small"
                options={[
                  {
                    label: locale?.['htmlPreview.preview'] || '预览',
                    value: 'preview',
                  },
                  {
                    label: locale?.['htmlPreview.code'] || '代码',
                    value: 'code',
                  },
                ]}
                value={htmlViewMode}
                onChange={(val) => setHtmlViewMode(val as 'preview' | 'code')}
              />
            )}
            {customActions && (
              <div
                className={classNames(`${prefixCls}-custom-actions`, hashId)}
              >
                {customActions}
              </div>
            )}
            {onLocate && file.canLocate === true && (
              <ActionIconBox
                title={locale?.['workspace.file.location'] || '定位'}
                onClick={handleLocate}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(`${prefixCls}-item-action-btn`, hashId)}
              >
                <Locate />
              </ActionIconBox>
            )}
            {onShare && file.canShare === true && (
              <ActionIconBox
                title={locale?.['workspace.file.share'] || '分享'}
                onClick={handleShare}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(`${prefixCls}-item-action-btn`, hashId)}
              >
                <ShareIcon />
              </ActionIconBox>
            )}
            {canDownload && onDownload && (
              <ActionIconBox
                title={locale?.['workspace.file.download'] || '下载'}
                onClick={handleDownload}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(`${prefixCls}-item-action-btn`, hashId)}
              >
                <DownloadIcon />
              </ActionIconBox>
            )}
          </div>
        </div>
      )}
      <div className={classNames(`${prefixCls}-content`, hashId)}>
        {renderPreviewContent()}
      </div>
    </div>
  );
};
