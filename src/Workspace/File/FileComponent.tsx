import { ConfigProvider, Image, Input, Spin, Typography, message } from 'antd';

import {
  Check,
  ChevronDown as DownIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  Locate,
  ChevronRight as RightIcon,
  Search,
  SquareArrowOutUpRight as ShareIcon,
} from '@sofa-design/icons';
import { Empty } from 'antd';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  type FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import type { MarkdownEditorProps } from '../../MarkdownEditor';
import type { FileNode, FileProps, FileType, GroupNode } from '../types';
import { formatFileSize, formatLastModified } from '../utils';
import { fileTypeProcessor, isImageFile } from './FileTypeProcessor';
import { PreviewComponent } from './PreviewComponent';
import { useFileStyle } from './style';
import { generateUniqueId, getFileTypeIcon, getGroupIcon } from './utils';

// 通用的键盘事件处理函数
const handleKeyboardEvent = (
  e: React.KeyboardEvent,
  callback: (e: any) => void,
) => {
  if (e.key === 'Enter' || e.key === ' ') {
    callback(e);
  }
};

// 通用的下载处理函数
const handleFileDownload = (file: FileNode) => {
  let blobUrl: string | null = null;

  try {
    // 创建下载链接
    const link = document.createElement('a');

    if (file.url) {
      // 使用url作为下载链接
      link.href = file.url;
    } else if (file.content) {
      // 使用文件内容创建 Blob 对象
      const blob = new Blob([file.content], { type: 'text/plain' });
      blobUrl = URL.createObjectURL(blob);
      link.href = blobUrl;
    } else if (file.file instanceof File || file.file instanceof Blob) {
      // 处理 File 或 Blob 对象
      blobUrl = URL.createObjectURL(file.file);
      link.href = blobUrl;
    } else {
      return; // 没有可下载的内容
    }

    // 设置文件名（如果是 File 对象且没有指定文件名，使用 File 对象的名称）
    link.download =
      file.name || (file.file instanceof File ? file.file.name : '');

    // 执行下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // 清理 Blob URL
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
  }
};

// 通用的默认分享处理函数
const handleDefaultShare = async (file: FileNode, locale?: any) => {
  try {
    const shareUrl = file.url || file.previewUrl || window.location.href;
    await navigator.clipboard.writeText(shareUrl);
    message.success({
      icon: (
        <Check
          style={{
            fontSize: 16,
            marginRight: 8,
            color: 'var(--color-green-control-fill-primary)',
          }}
        />
      ),
      content: (
        <span
          style={{
            font: 'var(--font-text-body-emphasized-base)',
            color: 'var(--color-gray-text-default)',
          }}
        >
          {locale?.['workspace.file.linkCopied'] || '已复制链接'}
        </span>
      ),
    });
  } catch (error) {
    // 如果复制失败，显示错误提示
    message.error(locale?.['workspace.file.copyFailed'] || '复制失败');
  }
};

// 确保节点有唯一ID的辅助函数
const ensureNodeWithId = <T extends FileNode | GroupNode>(node: T): T => ({
  ...node,
  id: node.id || generateUniqueId(node),
});

// 获取文件预览源的辅助函数
const getPreviewSource = (file: FileNode): string => {
  return file.previewUrl || file.url || '';
};

// 通用的可访问按钮组件
interface AccessibleButtonProps {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  ariaLabel: string;
  id?: string;
}

const AccessibleButton: FC<AccessibleButtonProps> = ({
  icon,
  onClick,
  className,
  ariaLabel,
  id,
}) => (
  <div
    id={id}
    className={className}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => handleKeyboardEvent(e, onClick)}
    aria-label={ariaLabel}
  >
    {icon}
  </div>
);

// 搜索框组件 - 确保在所有渲染路径中保持一致
interface SearchInputProps {
  keyword?: string;
  onChange?: (keyword: string) => void;
  searchPlaceholder?: string;
  prefixCls: string;
  hashId: string;
  locale?: any;
}

const SearchInput: FC<SearchInputProps> = React.memo(
  ({ keyword, onChange, searchPlaceholder, prefixCls, hashId, locale }) => {
    const inputRef = useRef<any>(null);

    return (
      <div className={classNames(`${prefixCls}-search`, hashId)}>
        <Input
          ref={inputRef}
          key="file-search-input" // 添加稳定的 key
          style={{ marginBottom: 8 }}
          allowClear
          placeholder={
            searchPlaceholder ||
            locale?.['workspace.searchPlaceholder'] ||
            '搜索文件名'
          }
          prefix={
            <Search
              style={{
                color: 'var(--color-gray-text-secondary)',
                fontSize: 16,
              }}
            />
          }
          value={keyword ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

// 文件项组件
const FileItemComponent: FC<{
  file: FileNode;
  onClick?: (file: FileNode) => void;
  onDownload?: (file: FileNode) => void;
  onPreview?: (file: FileNode) => void;
  onShare?: (
    file: FileNode,
    ctx?: { anchorEl?: HTMLElement; origin: 'list' | 'preview' },
  ) => void;
  onLocate?: (file: FileNode) => void;
  prefixCls?: string;
  hashId?: string;
  /** 是否在元素上绑定 id（默认 false） */
  bindDomId?: boolean;
}> = ({
  file,
  onClick,
  onDownload,
  onPreview,
  onShare,
  onLocate,
  prefixCls,
  hashId,
  bindDomId = false,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const finalPrefixCls = prefixCls || getPrefixCls('workspace-file');
  // 确保文件有唯一ID
  const fileWithId = ensureNodeWithId(file);
  const fileTypeInfo = fileTypeProcessor.inferFileType(fileWithId);

  const handleClick = () => {
    // 如果有传入 onClick 事件，优先使用
    if (onClick) {
      onClick(fileWithId);
      return;
    }

    // 如果没有传入 onClick 事件，默认打开预览页面
    if (onPreview) {
      onPreview(fileWithId);
    }
  };

  // 判断是否显示下载按钮：优先使用用户 canDownload；否则当存在 onDownload/url/content/file 时显示
  const showDownloadButton = (() => {
    if (fileWithId.canDownload !== undefined) {
      return fileWithId.canDownload;
    }
    return Boolean(
      onDownload || fileWithId.url || fileWithId.content || fileWithId.file,
    );
  })();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 优先使用用户传入的下载方法
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

    // 如果有自定义的分享方法，优先使用
    if (onShare) {
      onShare(fileWithId, {
        anchorEl: e.currentTarget as HTMLElement,
        origin: 'list',
      });
      return;
    }

    // 使用默认分享行为
    handleDefaultShare(fileWithId, locale);
  };

  // 判断是否显示预览按钮：
  // 1. 如果用户设置了 canPreview，优先使用用户的设置
  // 2. 如果没有设置，则使用系统默认逻辑：图片类型有 url 就可以预览；其他类型按原有逻辑判断
  const showPreviewButton = (() => {
    // 如果用户明确设置了 canPreview，直接使用用户设置
    if (fileWithId.canPreview !== undefined) {
      return fileWithId.canPreview;
    }

    // 否则使用系统默认逻辑
    return (
      onPreview &&
      (isImageFile(fileWithId)
        ? !!(fileWithId.url || fileWithId.previewUrl)
        : fileTypeProcessor.processFile(fileWithId).canPreview)
    );
  })();

  const showShareButton = fileWithId.canShare === true;

  const showLocationButton = fileWithId.canLocate === true;

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLocate?.(fileWithId);
  };

  return (
    <AccessibleButton
      icon={
        <>
          <div className={classNames(`${finalPrefixCls}-item-icon`, hashId)}>
            {getFileTypeIcon(
              fileTypeInfo.fileType,
              fileWithId.icon,
              fileWithId.name,
            )}
          </div>
          <div className={classNames(`${finalPrefixCls}-item-info`, hashId)}>
            <div className={classNames(`${finalPrefixCls}-item-name`, hashId)}>
              <Typography.Text ellipsis={{ tooltip: fileWithId.name }}>
                {fileWithId.name}
              </Typography.Text>
            </div>
            <div
              className={classNames(`${finalPrefixCls}-item-details`, hashId)}
            >
              <Typography.Text type="secondary" ellipsis>
                <span
                  className={classNames(`${finalPrefixCls}-item-type`, hashId)}
                >
                  {fileTypeInfo.displayType || fileTypeInfo.fileType}
                </span>
                {fileWithId.size && (
                  <>
                    <span
                      className={classNames(
                        `${finalPrefixCls}-item-separator`,
                        hashId,
                      )}
                    >
                      |
                    </span>
                    <span
                      className={classNames(
                        `${finalPrefixCls}-item-size`,
                        hashId,
                      )}
                    >
                      {formatFileSize(fileWithId.size)}
                    </span>
                  </>
                )}
                {fileWithId.lastModified && (
                  <>
                    <span
                      className={classNames(
                        `${finalPrefixCls}-item-separator`,
                        hashId,
                      )}
                    >
                      |
                    </span>
                    <span
                      className={classNames(
                        `${finalPrefixCls}-item-time`,
                        hashId,
                      )}
                    >
                      {formatLastModified(fileWithId.lastModified)}
                    </span>
                  </>
                )}
              </Typography.Text>
            </div>
          </div>
          <div
            className={classNames(`${finalPrefixCls}-item-actions`, hashId)}
            onClick={(e) => e.stopPropagation()}
          >
            {showPreviewButton && (
              <ActionIconBox
                title={locale?.['workspace.file.preview'] || '预览'}
                onClick={handlePreview}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(
                  `${finalPrefixCls}-item-action-btn`,
                  hashId,
                )}
              >
                <EyeIcon />
              </ActionIconBox>
            )}
            {showLocationButton && (
              <ActionIconBox
                title={locale?.['workspace.file.location'] || '定位'}
                onClick={handleLocate}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(
                  `${finalPrefixCls}-item-action-btn`,
                  hashId,
                )}
              >
                <Locate />
              </ActionIconBox>
            )}
            {showShareButton && (
              <ActionIconBox
                title={locale?.['workspace.file.share'] || '分享'}
                onClick={handleShare}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(
                  `${finalPrefixCls}-item-action-btn`,
                  hashId,
                )}
              >
                <ShareIcon />
              </ActionIconBox>
            )}
            {showDownloadButton && (
              <ActionIconBox
                title={locale?.['workspace.file.download'] || '下载'}
                onClick={handleDownload}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(
                  `${finalPrefixCls}-item-action-btn`,
                  hashId,
                )}
              >
                <DownloadIcon />
              </ActionIconBox>
            )}
          </div>
        </>
      }
      onClick={handleClick}
      className={classNames(`${finalPrefixCls}-item`, hashId)}
      ariaLabel={`${locale?.['workspace.file'] || '文件'}：${fileWithId.name}`}
      id={bindDomId ? fileWithId.id : undefined}
    />
  );
};

// 分组标题栏组件
const GroupHeader: FC<{
  group: GroupNode;
  onToggle?: (groupId: string, type: FileType, collapsed: boolean) => void;
  onGroupDownload?: (files: FileNode[], groupType: FileType) => void;
  prefixCls?: string;
  hashId?: string;
}> = ({ group, onToggle, onGroupDownload, prefixCls, hashId }) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const finalPrefixCls = prefixCls || getPrefixCls('workspace-file');
  const groupTypeInfo = fileTypeProcessor.inferFileType(group);
  const groupType = group.type || groupTypeInfo.fileType;

  const handleToggle = () => {
    onToggle?.(group.id!, groupType, !group.collapsed);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGroupDownload?.(group.children, groupType);
  };

  const CollapseIcon = group.collapsed ? RightIcon : DownIcon;

  // 获取分组图标
  const groupIcon = getGroupIcon(group, groupType, group.icon);

  // 判断是否显示下载按钮：优先使用用户 canDownload；否则当存在 onGroupDownload 时显示
  const showDownloadButton = (() => {
    if (group.canDownload !== undefined) {
      return group.canDownload;
    }
    if (!onGroupDownload) {
      return false;
    }
    // 如果组内所有文件都明确禁止下载，则不显示分组下载
    return group.children.some(
      (child) =>
        child.canDownload === true ||
        (child.canDownload !== false &&
          Boolean(child.url || child.content || child.file)),
    );
  })();

  return (
    <AccessibleButton
      icon={
        <>
          <div
            className={classNames(
              `${finalPrefixCls}-group-header-left`,
              hashId,
            )}
          >
            <CollapseIcon
              className={classNames(
                `${finalPrefixCls}-group-toggle-icon`,
                hashId,
              )}
            />
            <div
              className={classNames(
                `${finalPrefixCls}-group-type-icon`,
                hashId,
              )}
            >
              {groupIcon}
            </div>
            <span
              className={classNames(
                `${finalPrefixCls}-group-type-name`,
                hashId,
              )}
            >
              {group.name}
            </span>
          </div>
          <div
            className={classNames(
              `${finalPrefixCls}-group-header-right`,
              hashId,
            )}
          >
            <span
              className={classNames(`${finalPrefixCls}-group-count`, hashId)}
            >
              {group.children.length}
            </span>
            {showDownloadButton && (
              <ActionIconBox
                title={locale?.['workspace.file.download'] || '下载'}
                onClick={handleDownload}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(
                  `${finalPrefixCls}-group-action-btn`,
                  hashId,
                )}
              >
                <DownloadIcon />
              </ActionIconBox>
            )}
          </div>
        </>
      }
      onClick={handleToggle}
      className={classNames(`${finalPrefixCls}-group-header`, hashId)}
      ariaLabel={`${group.collapsed ? locale?.['workspace.expand'] || '展开' : locale?.['workspace.collapse'] || '收起'}${group.name}${locale?.['workspace.group'] || '分组'}`}
    />
  );
};

// 文件分组组件
const FileGroupComponent: FC<{
  group: GroupNode;
  onToggle?: (groupId: string, type: FileType, collapsed: boolean) => void;
  onGroupDownload?: (files: FileNode[], groupType: FileType) => void;
  onDownload?: (file: FileNode) => void;
  onFileClick?: (file: FileNode) => void;
  onPreview?: (file: FileNode) => void;
  onShare?: (
    file: FileNode,
    ctx?: { anchorEl?: HTMLElement; origin: 'list' | 'preview' },
  ) => void;
  onLocate?: (file: FileNode) => void;
  prefixCls?: string;
  hashId?: string;
  bindDomId?: boolean;
}> = ({
  group,
  onToggle,
  onGroupDownload,
  onDownload,
  onFileClick,
  onPreview,
  onShare,
  onLocate,
  prefixCls,
  hashId,
  bindDomId,
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const finalPrefixCls = prefixCls || getPrefixCls('workspace-file');
  const contentVariants = useMemo(
    () => ({
      expanded: {
        height: 'auto',
        opacity: 1,
      },
      collapsed: {
        height: 0,
        opacity: 0,
      },
    }),
    [],
  );

  const contentTransition = useMemo(
    () => ({
      height: {
        duration: 0.26,
        ease: [0.4, 0, 0.2, 1],
      },
      opacity: {
        duration: 0.2,
        ease: 'linear',
      },
    }),
    [],
  );
  return (
    <div className={classNames(`${finalPrefixCls}-container--group`, hashId)}>
      <GroupHeader
        group={group}
        onToggle={onToggle}
        onGroupDownload={onGroupDownload}
        prefixCls={finalPrefixCls}
        hashId={hashId}
      />
      <AnimatePresence initial={false}>
        {!group.collapsed && (
          <motion.div
            key="group-content"
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={contentTransition}
            style={{ overflow: 'hidden' }}
            className={classNames(`${finalPrefixCls}-group-content`, hashId)}
          >
            {group.children.map((file) => (
              <FileItemComponent
                key={file.id}
                file={file}
                onClick={onFileClick}
                onDownload={onDownload}
                onPreview={onPreview}
                onShare={onShare}
                onLocate={onLocate}
                prefixCls={finalPrefixCls}
                hashId={hashId}
                bindDomId={!!bindDomId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FileComponent: FC<{
  nodes: FileProps['nodes'];
  onGroupDownload?: FileProps['onGroupDownload'];
  onDownload?: FileProps['onDownload'];
  onShare?: FileProps['onShare'];
  onFileClick?: FileProps['onFileClick'];
  onLocate?: FileProps['onLocate'];
  onToggleGroup?: FileProps['onToggleGroup'];
  onPreview?: FileProps['onPreview'];
  onBack?: FileProps['onBack'];
  /** 重置标识，用于重置预览状态（内部使用） */
  resetKey?: FileProps['resetKey'];
  /**
   * MarkdownEditor 的配置项，用于自定义预览效果
   * @description 这里的配置会覆盖默认的预览配置
   */
  markdownEditorProps?: Partial<
    Omit<MarkdownEditorProps, 'editorRef' | 'initValue' | 'readonly'>
  >;
  /**
   * 自定义预览页面右侧操作区域
   * @description 可以是 ReactNode 或者根据文件返回 ReactNode 的函数
   */
  customActions?: React.ReactNode | ((file: FileNode) => React.ReactNode);
  actionRef?: FileProps['actionRef'];
  loading?: FileProps['loading'];
  loadingRender?: FileProps['loadingRender'];
  emptyRender?: FileProps['emptyRender'];
  /** 搜索关键字（受控） */
  keyword?: string;
  /** 搜索关键字变化回调 */
  onChange?: (keyword: string) => void;
  /** 是否显示搜索框，默认显示 */
  showSearch?: boolean;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 是否在元素上绑定 DOM id（默认 false） */
  bindDomId?: FileProps['bindDomId'];
}> = ({
  nodes,
  onGroupDownload,
  onDownload,
  onShare,
  onFileClick,
  onLocate,
  onToggleGroup,
  onPreview,
  onBack,
  resetKey,
  markdownEditorProps,
  customActions,
  actionRef,
  loading,
  loadingRender,
  emptyRender,
  keyword,
  onChange,
  showSearch = false,
  searchPlaceholder,
  bindDomId = false,
}) => {
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const [customPreviewContent, setCustomPreviewContent] =
    useState<React.ReactNode | null>(null);
  const [customPreviewHeader, setCustomPreviewHeader] =
    useState<React.ReactNode | null>(null);
  // 标题区域文件信息覆盖，仅影响展示
  const [headerFileOverride, setHeaderFileOverride] =
    useState<Partial<FileNode> | null>(null);
  const [imagePreview, setImagePreview] = useState<{
    visible: boolean;
    src: string;
  }>({ visible: false, src: '' });
  // 添加内部状态来管理分组的折叠状态
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  // 追踪预览请求的序号，避免异步竞态
  const previewRequestIdRef = useRef(0);
  // 缓存节点 ID，避免每次渲染重新生成（使用 WeakMap 自动清理不再使用的节点）
  const nodeIdCacheRef = useRef<WeakMap<FileNode | GroupNode, string>>(
    new WeakMap(),
  );

  const safeNodes = nodes || [];

  // 使用 ConfigProvider 获取前缀类名
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefixCls = getPrefixCls('workspace-file');

  const { wrapSSR, hashId } = useFileStyle(prefixCls);

  // 确保节点有稳定的唯一 ID（使用缓存）
  const ensureNodeWithStableId = <T extends FileNode | GroupNode>(
    node: T,
  ): T => {
    if (node.id) return { ...node };

    // 尝试从缓存获取 ID
    let cachedId = nodeIdCacheRef.current.get(node);
    if (!cachedId) {
      // 生成新 ID 并缓存
      cachedId = generateUniqueId(node);
      nodeIdCacheRef.current.set(node, cachedId);
    }

    return {
      ...node,
      id: cachedId,
    };
  };

  // 返回列表（供预览页调用）
  const handleBackToList = () => {
    // 使进行中的预览请求失效
    previewRequestIdRef.current++;
    setPreviewFile(null);
    setCustomPreviewContent(null);
    setCustomPreviewHeader(null);
    setHeaderFileOverride(null);
  };

  // 监听 resetKey 变化，重置预览状态
  useEffect(() => {
    if (resetKey !== undefined && previewFile) {
      // 当 resetKey 变化且当前处于预览状态时，重置预览状态
      handleBackToList();
    }
  }, [resetKey]);

  // 监听 nodes 变化，同步更新 previewFile
  useEffect(() => {
    if (!previewFile) return;

    // 在所有节点中查找与当前预览文件匹配的文件
    const findUpdatedFile = (
      nodesList: (FileNode | GroupNode)[],
    ): FileNode | null => {
      for (const node of nodesList) {
        if ('children' in node) {
          // 分组节点，递归查找子节点
          const found = findUpdatedFile(node.children);
          if (found) return found;
        } else {
          // 文件节点，比较 ID 或文件引用
          if (
            (node.id && node.id === previewFile.id) ||
            (node.name === previewFile.name && node.type === previewFile.type)
          ) {
            return node;
          }
        }
      }
      return null;
    };

    const updatedFile = findUpdatedFile(safeNodes);

    // 如果找到了更新的文件，更新 previewFile
    if (updatedFile) {
      setPreviewFile(updatedFile);
    }
  }, [nodes]);

  // 处理分组折叠/展开
  const handleToggleGroup = (
    groupId: string,
    type: FileType,
    collapsed: boolean,
  ) => {
    // 更新内部状态，使用 groupId 作为 key
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: collapsed,
    }));
    // 如果外部提供了回调，也调用它
    onToggleGroup?.(type, collapsed);
  };

  // 包装后的返回逻辑，允许外部拦截
  const handleBack = async () => {
    if (previewFile) {
      try {
        const result = await (onBack?.(previewFile) as any);
        if (result === false) return;
      } catch (_) {
        // 外部抛错不应阻断默认行为
      }
    }
    handleBackToList();
  };

  // 预览页面的下载（供预览页调用）
  const handleDownloadInPreview = (file: FileNode) => {
    // 优先使用用户传入的下载方法
    if (onDownload) {
      onDownload(file);
      return;
    }

    handleFileDownload(file);
  };

  // 预览文件处理
  const handlePreview = async (file: FileNode) => {
    // 如果用户提供了预览方法，尝试使用用户的方法
    if (onPreview) {
      const currentCallId = ++previewRequestIdRef.current;

      try {
        const previewData = await onPreview(file);
        if (previewRequestIdRef.current !== currentCallId) return;
        // 当用户返回 false：阻止内部预览逻辑，交由外部处理（如自定义弹窗）
        if (previewData === false) {
          setCustomPreviewContent(null);
          setCustomPreviewHeader(null);
          setPreviewFile(null);
          return;
        }
        // 只有当返回结果不是 false 时，才设置预览文件并处理预览数据
        if (previewData) {
          // 区分返回类型：ReactNode -> 自定义内容；FileNode -> 新文件预览
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
                      // 为保持回调参数签名一致，显式传入第二个参数为 undefined
                      onShare(file, undefined);
                    } else {
                      handleDefaultShare(file, locale);
                    }
                  },
                })
              : (previewData as React.ReactNode);
            setCustomPreviewHeader(null);
            setCustomPreviewContent(content);
          } else if (
            typeof previewData === 'object' &&
            previewData !== null &&
            'name' in (previewData as any)
          ) {
            setCustomPreviewContent(null);
            setCustomPreviewHeader(null);
            setPreviewFile(previewData as FileNode);
          } else {
            setCustomPreviewContent(null);
            setCustomPreviewHeader(null);
            setPreviewFile(file);
          }
          return;
        }
        // previewData 为 undefined 或 null，使用默认预览
        setCustomPreviewContent(null);
        setPreviewFile(file);
        return;
      } catch (err) {
        if (previewRequestIdRef.current !== currentCallId) return;
        setCustomPreviewContent(null);
        setPreviewFile(file);
        return;
      }
    }

    // 使用组件库内部的预览逻辑
    if (isImageFile(file)) {
      const previewSrc = getPreviewSource(file);
      setImagePreview({
        visible: true,
        src: previewSrc,
      });
      return;
    }
    setCustomPreviewContent(null);
    setPreviewFile(file);
  };

  // 通过 actionRef 暴露可编程接口
  React.useEffect(() => {
    if (!actionRef) return;
    actionRef.current = {
      openPreview: (file: FileNode) => {
        const fileWithId = ensureNodeWithStableId(file);
        void handlePreview(fileWithId);
      },
      backToList: () => {
        handleBackToList();
      },
      updatePreviewHeader: (partial) => {
        setHeaderFileOverride((prev) => ({ ...(prev || {}), ...partial }));
      },
    };
    return () => {
      actionRef.current = null;
    };
  }, [actionRef, handlePreview, handleBackToList]);

  const hasKeyword = Boolean((keyword ?? '').trim());

  // 渲染搜索框组件 - 确保在所有情况下都保持一致
  const renderSearchInput = () => {
    if (!showSearch) return null;
    return (
      <SearchInput
        keyword={keyword}
        onChange={onChange}
        searchPlaceholder={searchPlaceholder}
        prefixCls={prefixCls}
        hashId={hashId}
        locale={locale}
      />
    );
  };

  // 渲染空状态内容
  const renderEmptyContent = () => {
    if (hasKeyword) {
      return (
        <Typography.Text type="secondary">
          {(
            locale?.['workspace.noResultsFor'] ||
            `未找到与「${keyword}」匹配的结果`
          ).replace('${keyword}', String(keyword))}
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

  // 图片预览组件
  const ImagePreviewComponent = (
    <Image
      style={{ display: 'none' }}
      src={imagePreview.src}
      preview={{
        visible: imagePreview.visible,
        onVisibleChange: (visible) => {
          setImagePreview((prev) => ({ ...prev, visible }));
        },
      }}
    />
  );

  // 如果正在预览文件，显示预览组件
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
              handleDefaultShare(file, locale);
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

  // 渲染文件内容
  const renderFileContent = () => {
    if ((!nodes || nodes.length === 0) && !loading) {
      return (
        <div className={classNames(`${prefixCls}-empty`, hashId)}>
          {renderEmptyContent()}
        </div>
      );
    }

    if (safeNodes.length === 0) {
      return (
        <div className={classNames(`${prefixCls}-empty`, hashId)}>
          {renderEmptyContent()}
        </div>
      );
    }

    return safeNodes.map((node: FileNode | GroupNode) => {
      const nodeWithId = ensureNodeWithStableId(node);

      if ('children' in nodeWithId) {
        // 分组节点，使用内部状态覆盖外部的 collapsed 属性
        const groupNode: GroupNode = {
          ...nodeWithId,
          collapsed: collapsedGroups[nodeWithId.id!] ?? nodeWithId.collapsed,
          // 确保子节点也有唯一ID
          children: nodeWithId.children.map(ensureNodeWithStableId),
        };
        return (
          <FileGroupComponent
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
            bindDomId={bindDomId}
          />
        );
      }

      // 文件节点
      return (
        <FileItemComponent
          key={nodeWithId.id}
          file={nodeWithId as FileNode}
          onClick={onFileClick}
          onDownload={onDownload}
          onShare={onShare}
          onPreview={handlePreview}
          onLocate={onLocate}
          prefixCls={prefixCls}
          hashId={hashId}
          bindDomId={bindDomId}
        />
      );
    });
  };

  // 统一的渲染逻辑 - 确保搜索框位置稳定
  return wrapSSR(
    <>
      {loading && loadingRender ? (
        // 使用自定义loading渲染函数
        <div
          className={classNames(`${prefixCls}-container`, hashId)}
          data-testid="file-component"
        >
          {renderSearchInput()}
          {loadingRender()}
        </div>
      ) : (
        // 使用默认的Spin组件
        <Spin spinning={!!loading}>
          <div
            className={classNames(`${prefixCls}-container`, hashId)}
            data-testid="file-component"
          >
            {renderSearchInput()}
            {renderFileContent()}
          </div>
        </Spin>
      )}
      {ImagePreviewComponent}
    </>,
  );
};
