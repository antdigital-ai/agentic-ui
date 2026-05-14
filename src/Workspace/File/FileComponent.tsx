import {
  ConfigProvider,
  Empty,
  Image,
  Segmented,
  Spin,
  Typography,
} from 'antd';
import classNames from 'clsx';
import React, { type FC, useContext, useEffect, useRef, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { I18nContext, compileTemplate } from '../../I18n';
import type { MarkdownEditorProps } from '../../MarkdownEditor';
import type {
  FileNode,
  FilePanelViewMode,
  FileProps,
  FileType,
  GroupNode,
} from '../types';
import {
  FileGroup,
  GROUP_INITIAL_PAGE_SIZE,
  GROUP_PAGE_SIZE_INCREMENT,
} from './components/FileGroup';
import { FileItem } from './components/FileItem';
import { SearchInput } from './components/SearchInput';
import { FileTree } from './FileTree';
import { isImageFile } from './FileTypeProcessor';
import {
  getPreviewSource,
  handleDefaultShare,
  handleFileDownload,
} from './handlers';
import { PreviewComponent } from './PreviewComponent';
import { useFileStyle } from './style';
import { generateUniqueId } from './utils';

/**
 * 检查 onPreview 返回值是否是 FileNode（最小可信判定：是非 ReactElement 的对象 + 含 `name` 字符串字段）
 */
const isFileNodeReturn = (value: unknown): value is FileNode => {
  if (!value || typeof value !== 'object') return false;
  if (React.isValidElement(value as object)) return false;
  return typeof (value as { name?: unknown }).name === 'string';
};

/**
 * 文件主组件：列表 / 分组 / 搜索 / 预览路由 + 渐进展示 + actionRef
 */
export const FileComponent: FC<{
  nodes: FileProps['nodes'];
  onGroupDownload?: FileProps['onGroupDownload'];
  onDownload?: FileProps['onDownload'];
  onShare?: FileProps['onShare'];
  onFileClick?: FileProps['onFileClick'];
  onLocate?: FileProps['onLocate'];
  /** @deprecated @since 2.29.0 请使用 onGroupToggle 替代 */
  onToggleGroup?: FileProps['onToggleGroup'];
  onGroupToggle?: FileProps['onGroupToggle'];
  onPreview?: FileProps['onPreview'];
  onBack?: FileProps['onBack'];
  /** 重置标识，用于重置预览状态（内部使用） */
  resetKey?: FileProps['resetKey'];
  markdownEditorProps?: Partial<
    Omit<MarkdownEditorProps, 'editorRef' | 'initValue' | 'readonly'>
  >;
  customActions?: React.ReactNode | ((file: FileNode) => React.ReactNode);
  actionRef?: FileProps['actionRef'];
  /**
   * @deprecated @since 2.29.0 请使用 isLoading 代替
   */
  loading?: FileProps['loading'];
  isLoading?: FileProps['isLoading'];
  loadingRender?: FileProps['loadingRender'];
  emptyRender?: FileProps['emptyRender'];
  /** 搜索关键字（受控） */
  keyword?: string;
  onChange?: (keyword: string) => void;
  /** 是否显示搜索框，默认不显示 */
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchPlaceholderTree?: string;
  bindDomId?: FileProps['bindDomId'];
  fileTreeSwitch?: FileProps['fileTreeSwitch'];
}> = ({
  nodes,
  onGroupDownload,
  onDownload,
  onShare,
  onFileClick,
  onLocate,
  onToggleGroup,
  onGroupToggle,
  onPreview,
  onBack,
  resetKey,
  markdownEditorProps,
  customActions,
  actionRef,
  loading: loadingProp,
  isLoading,
  loadingRender,
  emptyRender,
  keyword,
  onChange,
  showSearch = false,
  searchPlaceholder,
  searchPlaceholderTree,
  bindDomId = false,
  fileTreeSwitch,
}) => {
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const [customPreviewContent, setCustomPreviewContent] =
    useState<React.ReactNode | null>(null);
  const [customPreviewHeader, setCustomPreviewHeader] =
    useState<React.ReactNode | null>(null);
  const [headerFileOverride, setHeaderFileOverride] =
    useState<Partial<FileNode> | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    visible: boolean;
    src: string;
  }>({ visible: false, src: '' });
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [flatVisibleCount, setFlatVisibleCount] = useState(
    GROUP_INITIAL_PAGE_SIZE,
  );
  const [innerPanelView, setInnerPanelView] = useState<FilePanelViewMode>(
    () => fileTreeSwitch?.defaultView ?? 'list',
  );

  const isControlledPanelView = fileTreeSwitch?.view !== undefined;
  const panelView: FilePanelViewMode = fileTreeSwitch
    ? isControlledPanelView
      ? (fileTreeSwitch.view as FilePanelViewMode)
      : innerPanelView
    : 'list';

  // nodes / keyword 变化时重置扁平列表分页
  useEffect(() => {
    setFlatVisibleCount(GROUP_INITIAL_PAGE_SIZE);
  }, [nodes, keyword]);

  // 异步预览请求序号，避免竞态
  const previewRequestIdRef = useRef(0);
  // 节点 ID 缓存：WeakMap 自动回收，避免每次渲染重生成
  const nodeIdCacheRef = useRef<WeakMap<FileNode | GroupNode, string>>(
    new WeakMap(),
  );

  const safeNodes = nodes || [];
  // 优先使用 isLoading，向后兼容 loading
  const loading = isLoading ?? loadingProp;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefixCls = getPrefixCls('workspace-file');
  const { wrapSSR, hashId } = useFileStyle(prefixCls);

  // 注入稳定 ID（基于 WeakMap 缓存）
  const ensureNodeWithStableId = useRefFunction(
    <T extends FileNode | GroupNode>(node: T): T => {
      if (node.id) return { ...node };

      let cachedId = nodeIdCacheRef.current.get(node);
      if (!cachedId) {
        cachedId = generateUniqueId(node);
        nodeIdCacheRef.current.set(node, cachedId);
      }

      return { ...node, id: cachedId };
    },
  );

  // 返回列表（供预览页/外部调用）
  const handleBackToList = useRefFunction(() => {
    previewRequestIdRef.current++;
    setPreviewFile(null);
    setCustomPreviewContent(null);
    setCustomPreviewHeader(null);
    setHeaderFileOverride(null);
  });

  // resetKey 变化 → 重置预览（仅依赖 resetKey；勿依赖 previewFile，否则 onPreview 将 previewFile 从 null 置为有值时会再跑一遍 effect，在 resetKey 已为 0 等合法值时误触发返回列表）
  useEffect(() => {
    if (resetKey === undefined) return;
    handleBackToList();
  }, [resetKey, handleBackToList]);

  useEffect(() => {
    if (panelView === 'tree') {
      handleBackToList();
    }
  }, [panelView, handleBackToList]);

  // nodes 变化 → 同步更新 previewFile（保持预览内容跟随外部数据）
  useEffect(() => {
    if (!previewFile) return;

    const findUpdatedFile = (
      nodesList: (FileNode | GroupNode)[],
    ): FileNode | null => {
      for (const node of nodesList) {
        if ('children' in node) {
          const found = findUpdatedFile(node.children);
          if (found) return found;
        } else if (
          (node.id && node.id === previewFile.id) ||
          (node.name === previewFile.name && node.type === previewFile.type)
        ) {
          return node;
        }
      }
      return null;
    };

    const updatedFile = findUpdatedFile(safeNodes);
    if (updatedFile) {
      setPreviewFile(updatedFile);
    }
    // 故意使用 nodes 而非 safeNodes 作为依赖：safeNodes 每次渲染都是新引用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, previewFile?.id, previewFile?.name, previewFile?.type]);

  // 分组折叠/展开
  const handleToggleGroup = useRefFunction(
    (groupId: string, type: FileType, collapsed: boolean) => {
      setCollapsedGroups((prev) => ({ ...prev, [groupId]: collapsed }));
      if (onGroupToggle) {
        onGroupToggle(type, collapsed);
      } else if (onToggleGroup) {
        onToggleGroup(type, collapsed);
      }
    },
  );

  // 包装的返回逻辑：支持外部 onBack 拦截（返回 false 阻止）
  const handleBack = useRefFunction(async () => {
    if (previewFile) {
      try {
        const result = await Promise.resolve(onBack?.(previewFile));
        if (result === false) return;
      } catch {
        // 外部抛错不应阻断默认行为
      }
    }
    handleBackToList();
  });

  // 预览页内的下载
  const handleDownloadInPreview = useRefFunction((file: FileNode) => {
    if (onDownload) {
      onDownload(file);
      return;
    }
    handleFileDownload(file);
  });

  // 文件预览处理：支持自定义预览（onPreview 返回 false / ReactNode / FileNode / void）
  const handlePreview = useRefFunction(async (file: FileNode) => {
    if (onPreview) {
      const currentCallId = ++previewRequestIdRef.current;

      try {
        const previewData = await onPreview(file);
        if (previewRequestIdRef.current !== currentCallId) return;

        // 用户返回 false：阻止内部预览，交由外部处理
        if (previewData === false) {
          setCustomPreviewContent(null);
          setCustomPreviewHeader(null);
          setPreviewFile(null);
          return;
        }

        if (previewData) {
          // ReactNode / 字符串 / 数字 / 布尔 → 自定义内容渲染
          if (
            React.isValidElement(previewData) ||
            typeof previewData === 'string' ||
            typeof previewData === 'number' ||
            typeof previewData === 'boolean'
          ) {
            setPreviewFile(file);
            const content = React.isValidElement(previewData)
              ? React.cloneElement(previewData as React.ReactElement, {
                  setPreviewHeader: (header: React.ReactNode) =>
                    setCustomPreviewHeader(header),
                  back: handleBackToList,
                  download: () => handleDownloadInPreview(file),
                  share: () => {
                    if (onShare) {
                      onShare(file, undefined);
                    } else {
                      handleDefaultShare(file);
                    }
                  },
                })
              : (previewData as React.ReactNode);
            setCustomPreviewHeader(null);
            setCustomPreviewContent(content);
          } else if (isFileNodeReturn(previewData)) {
            // FileNode → 切换到该文件的默认预览
            setCustomPreviewContent(null);
            setCustomPreviewHeader(null);
            setPreviewFile(previewData);
          } else {
            setCustomPreviewContent(null);
            setCustomPreviewHeader(null);
            setPreviewFile(file);
          }
          return;
        }

        // previewData === undefined / null → 走默认预览
        setCustomPreviewContent(null);
        setPreviewFile(file);
        return;
      } catch {
        if (previewRequestIdRef.current !== currentCallId) return;
        setCustomPreviewContent(null);
        setPreviewFile(file);
        return;
      }
    }

    // 默认内部预览：图片走 antd Image preview，其他走 PreviewComponent
    if (isImageFile(file)) {
      setImagePreview({ visible: true, src: getPreviewSource(file) });
      return;
    }
    setCustomPreviewContent(null);
    setPreviewFile(file);
  });

  // 通过 actionRef 暴露可编程接口
  useEffect(() => {
    if (!actionRef) return;
    actionRef.current = {
      openPreview: (file: FileNode) => {
        const fileWithId = ensureNodeWithStableId(file);
        void handlePreview(fileWithId);
      },
      backToList: () => handleBackToList(),
      updatePreviewHeader: (partial) => {
        setHeaderFileOverride((prev) => ({ ...(prev || {}), ...partial }));
      },
    };
    return () => {
      actionRef.current = null;
    };
  }, [actionRef, handlePreview, handleBackToList]);

  const hasKeyword = Boolean((keyword ?? '').trim());

  const handlePanelViewChange = useRefFunction((next: FilePanelViewMode) => {
    if (!isControlledPanelView) {
      setInnerPanelView(next);
    }
    fileTreeSwitch?.onViewChange?.(next);
  });

  const renderToolbarRow = () => {
    const showSwitcher = Boolean(fileTreeSwitch);
    const showSearchInToolbar = showSearch;
    if (!showSwitcher && !showSearchInToolbar) {
      return null;
    }
    const listLabel =
      fileTreeSwitch?.listLabel ?? locale?.['workspace.file'] ?? 'File';
    const treeLabel =
      fileTreeSwitch?.treeLabel ??
      locale?.['workspace.fileTree'] ??
      'File tree';
    const switchTrailing = showSwitcher && !showSearchInToolbar;

    const resolvedSearchPlaceholder =
      fileTreeSwitch && panelView === 'tree'
        ? (searchPlaceholderTree ??
          locale?.['workspace.fileTreeSearchPlaceholder'] ??
          searchPlaceholder ??
          locale?.['workspace.searchPlaceholder'] ??
          '搜索已展开目录内的文件名')
        : (searchPlaceholder ??
          locale?.['workspace.searchPlaceholder'] ??
          '搜索文件名');

    return (
      <div
        className={classNames(`${prefixCls}-toolbar`, hashId)}
        data-testid="file-toolbar"
      >
        {showSearchInToolbar ? (
          <div className={classNames(`${prefixCls}-toolbar-search`, hashId)}>
            <SearchInput
              keyword={keyword}
              onChange={onChange}
              searchPlaceholder={resolvedSearchPlaceholder}
              prefixCls={prefixCls}
              hashId={hashId}
              locale={locale}
            />
          </div>
        ) : null}
        {showSwitcher ? (
          <Segmented<FilePanelViewMode>
            size="small"
            className={classNames(`${prefixCls}-toolbar-switch`, hashId, {
              [`${prefixCls}-toolbar-switch--trailing`]: switchTrailing,
            })}
            value={panelView}
            onChange={handlePanelViewChange}
            options={[
              { label: listLabel, value: 'list' },
              { label: treeLabel, value: 'tree' },
            ]}
            data-testid="file-panel-view-switch"
          />
        ) : null}
      </div>
    );
  };

  const renderEmptyContent = () => {
    if (hasKeyword) {
      return (
        <Typography.Text type="secondary">
          {compileTemplate(
            locale?.['workspace.noResultsFor'] ||
              '未找到与「${keyword}」匹配的结果',
            { keyword: String(keyword) },
          )}
        </Typography.Text>
      );
    }

    if (typeof emptyRender === 'function') {
      return emptyRender();
    }

    return (
      emptyRender ?? (
        <Empty description={locale?.['workspace.empty'] || 'No data'} />
      )
    );
  };

  const handleFlatShowMore = useRefFunction(() => {
    setFlatVisibleCount((prev) => prev + GROUP_PAGE_SIZE_INCREMENT);
  });

  const handleFlatShowMoreKeyDown = useRefFunction((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlatShowMore();
    }
  });

  const renderFileContent = () => {
    if (safeNodes.length === 0 && !loading) {
      return (
        <div className={classNames(`${prefixCls}-empty`, hashId)}>
          {renderEmptyContent()}
        </div>
      );
    }

    // 纯扁平列表（无 group）才走分页
    const isFlat = safeNodes.every((n) => !('children' in n));
    const nodesToRender = isFlat
      ? safeNodes.slice(0, flatVisibleCount)
      : safeNodes;
    const flatRemaining = isFlat ? safeNodes.length - flatVisibleCount : 0;
    const flatHasMore = flatRemaining > 0;

    const items = nodesToRender.map((node: FileNode | GroupNode) => {
      const nodeWithId = ensureNodeWithStableId(node);

      if ('children' in nodeWithId) {
        const groupNode: GroupNode = {
          ...nodeWithId,
          collapsed: collapsedGroups[nodeWithId.id!] ?? nodeWithId.collapsed,
          children: nodeWithId.children.map(ensureNodeWithStableId),
        };
        return (
          <FileGroup
            key={nodeWithId.id}
            group={groupNode}
            onToggle={handleToggleGroup}
            onGroupDownload={onGroupDownload}
            onDownload={onDownload}
            onFileClick={onFileClick}
            onPreview={handlePreview}
            onShare={onShare}
            onLocate={onLocate}
            prefixCls={prefixCls}
            hashId={hashId}
            locale={locale}
            bindDomId={bindDomId}
          />
        );
      }

      return (
        <FileItem
          key={nodeWithId.id}
          file={nodeWithId as FileNode}
          onClick={onFileClick}
          onDownload={onDownload}
          onShare={onShare}
          onPreview={handlePreview}
          onLocate={onLocate}
          prefixCls={prefixCls}
          hashId={hashId}
          locale={locale}
          bindDomId={bindDomId}
        />
      );
    });

    if (!flatHasMore) return items;

    const flatShowMoreLabel = compileTemplate(
      locale?.['workspace.file.showMore'] || '查看更多（还有 ${count} 个）',
      { count: String(flatRemaining) },
    );

    return (
      <>
        {items}
        <div
          role="button"
          tabIndex={0}
          className={classNames(`${prefixCls}-show-more`, hashId)}
          onClick={handleFlatShowMore}
          onKeyDown={handleFlatShowMoreKeyDown}
          aria-label={flatShowMoreLabel}
        >
          {flatShowMoreLabel}
        </div>
      </>
    );
  };

  // 隐藏的 antd Image，用于触发图片预览
  const ImagePreviewComponent = (
    <Image
      className={classNames(`${prefixCls}-hidden-image`, hashId)}
      src={imagePreview.src}
      preview={{
        visible: imagePreview.visible,
        onVisibleChange: (visible) => {
          setImagePreview((prev) => ({ ...prev, visible }));
        },
      }}
    />
  );

  // 预览页路由
  if (previewFile) {
    return (
      <>
        <PreviewComponent
          file={previewFile}
          onBack={handleBack}
          onDownload={handleDownloadInPreview}
          onShare={(file, options) => {
            if (onShare) {
              onShare(file, {
                anchorEl: options?.anchorEl,
                origin: 'preview',
              });
            } else {
              handleDefaultShare(file);
            }
          }}
          onLocate={onLocate}
          customContent={customPreviewContent || undefined}
          customHeader={customPreviewHeader || undefined}
          customActions={
            typeof customActions === 'function'
              ? customActions(previewFile)
              : customActions
          }
          headerFileOverride={headerFileOverride || undefined}
          markdownEditorProps={markdownEditorProps}
        />
        {ImagePreviewComponent}
      </>
    );
  }

  // 列表页路由：自定义 loading 渲染 vs 默认 Spin
  return wrapSSR(
    <>
      {loading && loadingRender ? (
        <div
          className={classNames(`${prefixCls}-container`, hashId)}
          data-testid="file-component"
        >
          {renderToolbarRow()}
          {loadingRender()}
        </div>
      ) : (
        <Spin spinning={!!loading}>
          <div
            className={classNames(`${prefixCls}-container`, hashId)}
            data-testid="file-component"
          >
            {renderToolbarRow()}
            {panelView === 'tree' && fileTreeSwitch ? (
              <div
                className={classNames(`${prefixCls}-tree-panel`, hashId)}
                data-testid="file-tree-embed"
              >
                <FileTree
                  {...fileTreeSwitch.treeProps}
                  resetKey={resetKey}
                  filterKeyword={
                    hasKeyword ? String(keyword ?? '').trim() : undefined
                  }
                />
              </div>
            ) : (
              renderFileContent()
            )}
          </div>
        </Spin>
      )}
      {ImagePreviewComponent}
    </>,
  );
};
