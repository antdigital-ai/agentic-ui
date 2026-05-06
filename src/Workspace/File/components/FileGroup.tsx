import classNames from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { type FC, useEffect, useMemo, useState } from 'react';
import { useRefFunction } from '../../../Hooks/useRefFunction';
import { compileTemplate } from '../../../I18n';
import type { FileNode, FileType, GroupNode } from '../../types';
import { FileItem } from './FileItem';
import { GroupHeader } from './GroupHeader';

/** 分组首屏展示的文件数 */
export const GROUP_INITIAL_PAGE_SIZE = 50;
/** 「查看更多」每次展开的额外文件数 */
export const GROUP_PAGE_SIZE_INCREMENT = 100;

export interface FileGroupProps {
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
  prefixCls: string;
  hashId: string;
  locale?: Record<string, string>;
  bindDomId?: boolean;
}

/**
 * 文件分组：标题栏 + 可折叠文件列表 + 渐进展示（首屏 50，每次再加 100）
 */
const FileGroupComponent: FC<FileGroupProps> = ({
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
  locale,
  bindDomId,
}) => {
  const [visibleCount, setVisibleCount] = useState(GROUP_INITIAL_PAGE_SIZE);

  // 分组数据变化时重置分页，避免切换数据源后一次性渲染过多节点
  useEffect(() => {
    setVisibleCount(GROUP_INITIAL_PAGE_SIZE);
  }, [group.id, group.children.length]);

  const totalCount = group.children.length;
  const visibleFiles = group.children.slice(0, visibleCount);
  const remainingCount = totalCount - visibleCount;
  const hasMore = remainingCount > 0;

  const handleShowMore = useRefFunction((e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleCount((prev) => prev + GROUP_PAGE_SIZE_INCREMENT);
  });

  const handleShowMoreKeyDown = useRefFunction((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setVisibleCount((prev) => prev + GROUP_PAGE_SIZE_INCREMENT);
    }
  });

  const contentVariants = useMemo(
    () => ({
      expanded: { height: 'auto', opacity: 1 },
      collapsed: { height: 0, opacity: 0 },
    }),
    [],
  );

  const contentTransition = useMemo(
    () => ({
      height: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.2, ease: 'linear' },
    }),
    [],
  );

  const showMoreLabel = hasMore
    ? compileTemplate(
        locale?.['workspace.file.showMore'] || '查看更多（还有 ${count} 个）',
        { count: String(remainingCount) },
      )
    : locale?.['workspace.file.showMoreFiles'] || '查看更多文件';

  return (
    <div className={classNames(`${prefixCls}-container--group`, hashId)}>
      <GroupHeader
        group={group}
        onToggle={onToggle}
        onGroupDownload={onGroupDownload}
        prefixCls={prefixCls}
        hashId={hashId}
        locale={locale}
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
            className={classNames(`${prefixCls}-group-content`, hashId)}
          >
            {visibleFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onClick={onFileClick}
                onDownload={onDownload}
                onPreview={onPreview}
                onShare={onShare}
                onLocate={onLocate}
                prefixCls={prefixCls}
                hashId={hashId}
                locale={locale}
                bindDomId={!!bindDomId}
              />
            ))}
            {hasMore && (
              <div
                role="button"
                tabIndex={0}
                className={classNames(`${prefixCls}-show-more`, hashId)}
                onClick={handleShowMore}
                onKeyDown={handleShowMoreKeyDown}
                aria-label={showMoreLabel}
              >
                {showMoreLabel}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

FileGroupComponent.displayName = 'FileGroup';

export const FileGroup = React.memo(FileGroupComponent);
