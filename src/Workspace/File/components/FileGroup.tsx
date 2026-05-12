import classNames from 'clsx';
import React, { type FC, useEffect, useRef, useState } from 'react';
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
  locale?: Record<string, any>;
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

  // 内容挂载状态：展开时立即挂载、折叠时等过渡结束再卸载
  // 这样既保留 CSS 折叠动画的视觉过渡，又让折叠后内容真正不可达（query / a11y / Tab）
  const [contentMounted, setContentMounted] = useState(!group.collapsed);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (!group.collapsed) {
      // 展开：立即挂载
      setContentMounted(true);
      return;
    }
    // 折叠：等 CSS 过渡结束（与 style.ts 中 0.26s 对齐）后卸载
    collapseTimerRef.current = setTimeout(() => {
      setContentMounted(false);
      collapseTimerRef.current = null;
    }, 280);
  }, [group.collapsed]);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

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
      {/*
        纯 CSS 折叠动画：
        - 外壳用 grid-template-rows: 1fr ↔ 0fr 让浏览器原生过渡行高
        - 内容始终挂载，避免折叠动画期间的子组件状态丢失与重渲染抖动
        - 折叠态置 aria-hidden 与 pointer-events: none（CSS 中），确保 a11y
      */}
      <div
        className={classNames(`${prefixCls}-group-content-wrapper`, hashId)}
        data-collapsed={group.collapsed ? 'true' : 'false'}
        aria-hidden={group.collapsed ? true : undefined}
      >
        <div className={classNames(`${prefixCls}-group-content`, hashId)}>
          {contentMounted &&
            visibleFiles.map((file) => (
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
          {contentMounted && hasMore && (
            <div
              role="button"
              tabIndex={group.collapsed ? -1 : 0}
              className={classNames(`${prefixCls}-show-more`, hashId)}
              onClick={handleShowMore}
              onKeyDown={handleShowMoreKeyDown}
              aria-label={showMoreLabel}
            >
              {showMoreLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FileGroupComponent.displayName = 'FileGroup';

export const FileGroup = FileGroupComponent;
