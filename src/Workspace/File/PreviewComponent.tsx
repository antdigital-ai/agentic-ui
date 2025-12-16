import { LoadingOutlined } from '@ant-design/icons';
import {
  Download as DownloadIcon,
  ArrowLeft as LeftIcon,
  Locate,
  SquareArrowOutUpRight as ShareIcon,
} from '@sofa-design/icons';
import {
  Alert,
  Button,
  ConfigProvider,
  Image,
  Segmented,
  Spin,
  Typography,
} from 'antd';
import classNames from 'classnames';
import React, { type FC, useContext, useEffect, useRef, useState } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import {
  MarkdownEditor,
  type MarkdownEditorInstance,
  type MarkdownEditorProps,
} from '../../MarkdownEditor';
import { HtmlPreview } from '../HtmlPreview';
import { FileNode } from '../types';
import { formatFileSize, formatLastModified } from '../utils';
import {
  getLanguageFromFilename,
  wrapContentInCodeBlock,
} from '../utils/codeLanguageUtils';
import { FileProcessResult, fileTypeProcessor } from './FileTypeProcessor';
import { useFileStyle } from './style';
import { getFileTypeIcon } from './utils';

const HTML_MIME_TYPE = 'text/html';
const HTML_EXTENSIONS = ['.html', '.htm'];
const EDITOR_PADDING = '0 12px';

const isHtmlFile = (fileName: string, mimeType?: string): boolean => {
  const name = fileName?.toLowerCase() || '';
  const byExtension = HTML_EXTENSIONS.some((ext) => name.endsWith(ext));
  const byMimeType = mimeType === HTML_MIME_TYPE;
  return byExtension || byMimeType;
};

const getContentStatus = (
  state: ContentState,
): 'loading' | 'error' | 'done' => {
  if ('error' in state) return 'error';
  return state.status === 'loading' ? 'loading' : 'done';
};

const buildMarkdownContent = (
  raw: string,
  category: string,
  fileName: string,
): string => {
  if (category === 'code') {
    const language = getLanguageFromFilename(fileName);
    return wrapContentInCodeBlock(raw, language);
  }
  return raw;
};

type ContentState =
  | {
      status: 'idle' | 'loading' | 'ready';
      mdContent: string;
      rawContent?: string;
    }
  | { status: 'error'; error: string };

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

// 占位符组件
const PlaceholderContent: FC<{
  children?: React.ReactNode;
  showFileInfo?: boolean;
  file?: FileNode;
  onDownload?: () => void;
  locale?: any;
  prefixCls?: string;
  hashId?: string;
}> = ({
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

/**
 * 文件预览组件
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
  const { wrapSSR, hashId } = useFileStyle(filePrefixCls);
  const prefixCls = `${filePrefixCls}-preview`;
  const editorRef = useRef<MarkdownEditorInstance>();
  const [processResult, setProcessResult] = useState<FileProcessResult | null>(
    null,
  );

  type ContentState =
    | {
        status: 'idle' | 'loading' | 'ready';
        mdContent: string;
        rawContent?: string;
      }
    | { status: 'error'; error: string };

  const [contentState, setContentState] = useState<ContentState>({
    status: 'idle',
    mdContent: '',
    rawContent: '',
  });
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

  useEffect(() => {
    if (customContent) return;
    try {
      const result = fileTypeProcessor.processFile(file);
      setProcessResult(result);
    } catch (err) {
      setContentState({
        status: 'error',
        error: err instanceof Error ? err.message : '文件处理失败',
      });
    }
  }, [file, customContent]);

  useEffect(() => {
    if (customContent || !processResult) return;

    const { typeInference, dataSource } = processResult;
    const isTextOrCode =
      typeInference.category === 'text' || typeInference.category === 'code';

    if (!isTextOrCode) return;

    const setReadyContent = (raw: string) => {
      setContentState({
        status: 'ready',
        mdContent: buildMarkdownContent(raw, typeInference.category, file.name),
        rawContent: raw,
      });
    };

    if (dataSource.content) {
      setReadyContent(dataSource.content);
      return;
    }

    if (dataSource.previewUrl) {
      setContentState({ status: 'loading', mdContent: '', rawContent: '' });

      fetch(dataSource.previewUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(setReadyContent)
        .catch((err) => {
          const errorMessage =
            err instanceof Error ? err.message : '加载文本内容失败';
          setContentState({ status: 'error', error: errorMessage });
          console.error('加载文本内容失败:', err);
        });
    }
  }, [processResult, file.name, customContent]);

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

  useEffect(() => {
    return () => {
      if (processResult) {
        fileTypeProcessor.cleanupResult(processResult);
      }
    };
  }, [processResult]);

  useEffect(() => {
    setHtmlViewMode('preview');
  }, [file.name]);

  const isCurrentFileHtml = isHtmlFile(
    file.name,
    processResult?.dataSource.mimeType,
  );

  const renderPreviewContent = () => {
    if (file.loading) {
      return (
        <div className={classNames(`${prefixCls}-content-loading`, hashId)}>
          <span
            className={classNames(`${prefixCls}-content-loading-tip`, hashId)}
          >
            <LoadingOutlined />
            正在生成
          </span>
          <div
            className={classNames(`${prefixCls}-content-loading-inner`, hashId)}
          >
            {file?.content?.padEnd(10000, file?.content) ||
              '...'.padEnd(10000, '...')}
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
          <Spin size="large" tip="正在处理文件..." />
        </PlaceholderContent>
      );
    }

    if (contentState.status === 'error') {
      return (
        <PlaceholderContent prefixCls={prefixCls} hashId={hashId}>
          <Alert
            message="文件处理失败"
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
                {getFileTypeIcon(
                  fileTypeProcessor.inferFileType(file).fileType,
                  file.icon,
                  file.name,
                )}
              </div>
              <div
                className={classNames(`${filePrefixCls}-item-info`, hashId)}
                style={{ textAlign: 'left' }}
              >
                <div
                  className={classNames(`${filePrefixCls}-item-name`, hashId)}
                >
                  <Typography.Text
                    ellipsis={{ tooltip: file.name }}
                    style={{
                      font: 'var(--font-text-h6-base)',
                      color: 'var(--color-gray-text-default)',
                    }}
                  >
                    {file.name}
                  </Typography.Text>
                </div>
                <div
                  className={classNames(
                    `${filePrefixCls}-item-details`,
                    hashId,
                  )}
                >
                  <Typography.Text type="secondary" ellipsis>
                    <span
                      className={classNames(
                        `${filePrefixCls}-item-type`,
                        hashId,
                      )}
                    >
                      {fileTypeProcessor.inferFileType(file).displayType ||
                        fileTypeProcessor.inferFileType(file).fileType}
                    </span>
                    {file.size && (
                      <>
                        <span
                          className={classNames(
                            `${filePrefixCls}-item-separator`,
                            hashId,
                          )}
                        >
                          |
                        </span>
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
                        <span
                          className={classNames(
                            `${filePrefixCls}-item-separator`,
                            hashId,
                          )}
                        >
                          |
                        </span>
                        <span
                          className={classNames(
                            `${filePrefixCls}-item-time`,
                            hashId,
                          )}
                        >
                          {formatLastModified(file.lastModified as any)}
                        </span>
                      </>
                    )}
                  </Typography.Text>
                </div>
              </div>
            </div>
            {canDownload && onDownload && (
              <>
                <div
                  className={classNames(
                    `${prefixCls}-unsupported-text`,
                    hashId,
                  )}
                >
                  此文件无法预览，请下载查看。
                </div>
                <Button
                  color="default"
                  variant="solid"
                  icon={<DownloadIcon />}
                  onClick={handleDownload}
                  aria-label={locale?.['workspace.file.download'] || '下载'}
                >
                  下载
                </Button>
              </>
            )}
          </div>
        </PlaceholderContent>
      );
    }

    const renderTextOrCode = () => {
      if (isCurrentFileHtml) {
        const htmlStatus = getContentStatus(contentState);
        return (
          <div className={classNames(`${prefixCls}-text`, hashId)}>
            <HtmlPreview
              html={contentState.rawContent || ''}
              status={htmlStatus as any}
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
            <Spin size="large" tip="正在加载文件内容..." />
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

    const getPreviewErrorMessage = (category: string): string => {
      const messages: Record<string, string> = {
        image:
          locale?.['workspace.file.cannotGetImagePreview'] ||
          '无法获取图片预览',
        video:
          locale?.['workspace.file.cannotGetVideoPreview'] ||
          '无法获取视频预览',
        audio:
          locale?.['workspace.file.cannotGetAudioPreview'] ||
          '无法获取音频预览',
        pdf:
          locale?.['workspace.file.cannotGetPdfPreview'] || '无法获取PDF预览',
      };
      return messages[category] || `无法获取${category}预览`;
    };

    const renderMediaPreview = (
      category: 'image' | 'video' | 'audio' | 'pdf',
    ) => {
      if (!dataSource.previewUrl) {
        return (
          <PlaceholderContent
            locale={locale}
            prefixCls={prefixCls}
            hashId={hashId}
          >
            <p>{getPreviewErrorMessage(category)}</p>
          </PlaceholderContent>
        );
      }

      const mediaElements: Record<string, React.ReactNode> = {
        image: (
          <div className={classNames(`${prefixCls}-image`, hashId)}>
            <Image src={dataSource.previewUrl} alt={file.name} />
          </div>
        ),
        video: (
          <video
            className={classNames(`${prefixCls}-video`, hashId)}
            src={dataSource.previewUrl}
            controls
            controlsList="nodownload"
            preload="metadata"
          >
            <track kind="captions" />
            您的浏览器不支持视频播放
          </video>
        ),
        audio: (
          <audio
            className={classNames(`${prefixCls}-audio`, hashId)}
            src={dataSource.previewUrl}
            controls
            controlsList="nodownload"
            preload="metadata"
          >
            您的浏览器不支持音频播放
          </audio>
        ),
        pdf: (
          <embed
            className={classNames(`${prefixCls}-pdf`, hashId)}
            src={dataSource.previewUrl}
            type="application/pdf"
            width="100%"
            height="100%"
          />
        ),
      };

      return mediaElements[category];
    };

    switch (typeInference.category) {
      case 'text':
      case 'code':
        return renderTextOrCode();

      case 'image':
      case 'video':
      case 'audio':
      case 'pdf':
        return renderMediaPreview(typeInference.category);

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
            <p>文件类型：{typeInference.fileType}</p>
          </PlaceholderContent>
        );
    }
  };

  return wrapSSR(
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
              {(() => {
                const headerFile = headerFileOverride
                  ? { ...file, ...headerFileOverride }
                  : file;
                const fileType = fileTypeProcessor.inferFileType(file).fileType;
                return (
                  <>
                    <span
                      className={classNames(`${prefixCls}-file-icon`, hashId)}
                    >
                      {getFileTypeIcon(
                        fileType,
                        headerFile.icon,
                        headerFile.name,
                      )}
                    </span>
                    <span
                      className={classNames(`${prefixCls}-file-name`, hashId)}
                    >
                      {headerFile.name}
                    </span>
                  </>
                );
              })()}
            </div>
            {(headerFileOverride?.lastModified ?? file.lastModified) && (
              <div className={classNames(`${prefixCls}-generate-time`, hashId)}>
                {locale?.['workspace.file.generationTime'] || '生成时间：'}
                {formatLastModified(
                  (headerFileOverride?.lastModified ??
                    file.lastModified) as any,
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
    </div>,
  );
};
