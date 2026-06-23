import {
  ChevronDown as DownIcon,
  Download as DownloadIcon,
  ChevronRight as RightIcon,
} from '@sofa-design/icons';
import classNames from 'clsx';
import React, { type FC } from 'react';
import { ActionIconBox } from '../../../Components/ActionIconBox';
import type { FileNode, FileType, GroupNode } from '../../types';
import { fileTypeProcessor } from '../FileTypeProcessor';
import { getGroupIcon } from '../utils';
import { AccessibleButton } from './AccessibleButton';

export interface GroupHeaderProps {
  group: GroupNode;
  onToggle?: (groupId: string, type: FileType, collapsed: boolean) => void;
  onGroupDownload?: (files: FileNode[], groupType: FileType) => void;
  prefixCls: string;
  hashId: string;
  locale?: Record<string, any>;
}

/**
 * 分组标题栏：可折叠 + 文件数 + 可选下载操作
 *
 * 下载按钮显示规则：
 * 1. 用户显式设置了 `group.canDownload`，遵循设置
 * 2. 未传入 `onGroupDownload`，不显示
 * 3. 否则只要组内存在任意一个可下载的子文件就显示
 */
const GroupHeaderComponent: FC<GroupHeaderProps> = ({
  group,
  onToggle,
  onGroupDownload,
  prefixCls,
  hashId,
  locale,
}) => {
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
  const groupIcon = getGroupIcon(group, groupType, group.icon);

  const showDownloadButton = (() => {
    if (group.canDownload !== undefined) return group.canDownload;
    if (!onGroupDownload) return false;
    return group.children.some(
      (child) =>
        child.canDownload === true ||
        (child.canDownload !== false &&
          Boolean(child.url || child.content || child.file)),
    );
  })();

  const expandLabel = group.collapsed
    ? locale?.['workspace.expand'] || '展开'
    : locale?.['workspace.collapse'] || '收起';
  const groupLabel = locale?.['workspace.group'] || '分组';

  return (
    <AccessibleButton
      icon={
        <>
          <div className={classNames(`${prefixCls}-group-header-left`, hashId)}>
            <CollapseIcon
              className={classNames(`${prefixCls}-group-toggle-icon`, hashId)}
            />
            <div className={classNames(`${prefixCls}-group-type-icon`, hashId)}>
              {groupIcon}
            </div>
            <span
              className={classNames(`${prefixCls}-group-type-name`, hashId)}
            >
              {group.name}
            </span>
          </div>
          <div
            className={classNames(`${prefixCls}-group-header-right`, hashId)}
          >
            <span className={classNames(`${prefixCls}-group-count`, hashId)}>
              {group.children.length}
            </span>
            {showDownloadButton && (
              <ActionIconBox
                title={locale?.['workspace.file.download'] || '下载'}
                onClick={handleDownload}
                tooltipProps={{ mouseEnterDelay: 0.3 }}
                className={classNames(`${prefixCls}-group-action-btn`, hashId)}
              >
                <DownloadIcon />
              </ActionIconBox>
            )}
          </div>
        </>
      }
      onClick={handleToggle}
      className={classNames(`${prefixCls}-group-header`, hashId)}
      ariaLabel={`${expandLabel}${group.name}${groupLabel}`}
    />
  );
};

GroupHeaderComponent.displayName = 'GroupHeader';

export const GroupHeader = GroupHeaderComponent;
