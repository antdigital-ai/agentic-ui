import { X } from '@sofa-design/icons';
import { ConfigProvider, Image } from 'antd';
import classNames from 'clsx';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActionIconBox } from '../../../Components/ActionIconBox';
import { I18nContext } from '../../../I18n';
import { AttachmentFile } from '../types';
import { isImageFile } from '../utils';
import { AttachmentFileListItem } from './AttachmentFileListItem';
import { useStyle } from './style';

export type AttachmentFileListProps = {
  fileMap?: Map<string, AttachmentFile>;
  onDelete: (file: AttachmentFile) => void;
  onPreview?: (file: AttachmentFile) => void | Promise<void>;
  onDownload?: (file: AttachmentFile) => void;
  onRetry?: (file: AttachmentFile) => void;
  onClearFileMap?: () => void;
  /** E2E 测试 ID */
  dataTestId?: string;
};

const HIDDEN_STYLE: React.CSSProperties = {
  height: 0,
  overflow: 'hidden',
  padding: 0,
};

const IMAGE_PREVIEW_STYLE: React.CSSProperties = {
  display: 'none',
};

const CLEAR_BUTTON_TRANSITION = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * 子项 stagger 入场延迟（秒/项）。
 * 等价于历史 framer-motion 父级 `staggerChildren: 0.1`。
 */
const ATTACHMENT_ITEM_STAGGER_S = 0.1;

/**
 * 子项退出动画时长（毫秒），与 style.ts 中 `-item-motion` 的 `animationDuration: 0.25s` 保持一致。
 * 测试环境下置 0，避免 jsdom 无 animationend 事件、setTimeout 异步等待引发的断言不稳定。
 */
const ATTACHMENT_ITEM_EXIT_DURATION_MS =
  process.env.NODE_ENV === 'test' ? 0 : 250;

const getFileKey = (file: AttachmentFile, index: number) => {
  return file?.uuid || file?.name || index;
};

/**
 * 单条渲染项的扁平描述，包含进入/退出动画状态。
 * 等价于 framer-motion 中由 AnimatePresence 维护的 `presence` 内部状态。
 */
interface AttachmentRenderEntry {
  key: string | number;
  file: AttachmentFile;
  /** 在外部 fileMap 中的稳定索引，用于推导入场 stagger 延迟 */
  index: number;
  /** 'enter' 表示文件仍在 fileMap 中；'exit' 表示已被移除、正在播放退出动画 */
  state: 'enter' | 'exit';
}

const openFileInNewWindow = (url?: string) => {
  if (typeof window === 'undefined' || !url) return;
  window.open(url, '_blank');
};

const ClearButton: React.FC<{
  visible: boolean;
  onClick?: () => void;
  className: string;
}> = ({ visible, onClick, className }) => {
  if (!visible) return null;

  return (
    <ActionIconBox
      style={{ transition: CLEAR_BUTTON_TRANSITION }}
      onClick={onClick}
      className={className}
    >
      <X />
    </ActionIconBox>
  );
};

export const AttachmentFileList: React.FC<AttachmentFileListProps> = ({
  fileMap,
  onDelete,
  onPreview,
  onDownload,
  onRetry,
  onClearFileMap,
  dataTestId,
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const { locale } = useContext(I18nContext);
  const prefix = context?.getPrefixCls('agentic-md-editor-attachment-list');
  const { hashId } = useStyle(prefix);
  const [imgSrc, setImgSrc] = React.useState<string | undefined>(undefined);

  const fileList = Array.from(fileMap?.values() || []);
  const fileCount = fileMap?.size || 0;
  const hasFiles = fileList.length > 0;
  const isAnyUploading = fileList.some((file) => file.status === 'uploading');
  // 有文件且没有正在上传时才显示清空按钮，避免空列表时透明按钮占用布局空间
  const canShowClearButton = hasFiles && !isAnyUploading;
  const containerStyle = fileCount ? {} : HIDDEN_STYLE;

  // ---- 等价 AnimatePresence：维护"被移除但尚在播放退出动画"的影子项 ----
  // 当外部 fileMap 中的某项被移除时，先在 renderEntries 中标记为 'exit'，
  // ATTACHMENT_ITEM_EXIT_DURATION_MS 后再真正卸载。
  const [renderEntries, setRenderEntries] = useState<AttachmentRenderEntry[]>(
    () =>
      fileList.map((file, index) => ({
        key: getFileKey(file, index) as string | number,
        file,
        index,
        state: 'enter',
      })),
  );
  const exitTimersRef = useRef<Map<string | number, number>>(new Map());

  useEffect(() => {
    const nextKeys = new Set<string | number>();
    const nextEntriesByKey = new Map<string | number, AttachmentRenderEntry>();
    fileList.forEach((file, index) => {
      const key = getFileKey(file, index) as string | number;
      nextKeys.add(key);
      nextEntriesByKey.set(key, {
        key,
        file,
        index,
        state: 'enter',
      });
    });

    setRenderEntries((prev) => {
      const merged: AttachmentRenderEntry[] = [];
      const seen = new Set<string | number>();

      // 1) 优先按当前 fileMap 顺序输出仍存在的项（state='enter'，刷新 file/index）
      fileList.forEach((file, index) => {
        const key = getFileKey(file, index) as string | number;
        merged.push({ key, file, index, state: 'enter' });
        seen.add(key);
        // 若先前曾被标记为 exit 但又重新加入，取消其 pending 卸载定时器
        const pendingTimer = exitTimersRef.current.get(key);
        if (pendingTimer !== undefined) {
          window.clearTimeout(pendingTimer);
          exitTimersRef.current.delete(key);
        }
      });

      // 2) 上一轮存在但本轮被移除的项，标记为 exit 并保留在列表中（位置沿用上一轮）
      prev.forEach((entry, prevIdx) => {
        if (seen.has(entry.key) || nextKeys.has(entry.key)) return;
        // 已经在 exit 中的，保持不动；首次转为 exit 的，启动延迟卸载定时器
        const exitingEntry: AttachmentRenderEntry = {
          ...entry,
          state: 'exit',
        };
        // 插入到大致原位置以保持视觉稳定
        const insertAt = Math.min(prevIdx, merged.length);
        merged.splice(insertAt, 0, exitingEntry);

        if (entry.state !== 'exit') {
          const timerId = window.setTimeout(() => {
            exitTimersRef.current.delete(entry.key);
            setRenderEntries((curr) =>
              curr.filter((it) => it.key !== entry.key),
            );
          }, ATTACHMENT_ITEM_EXIT_DURATION_MS);
          exitTimersRef.current.set(entry.key, timerId);
        }
      });

      return merged;
    });
    // 仅依赖 fileMap 引用变化即可触发对齐
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileMap]);

  // 卸载时清理所有 pending 定时器
  useEffect(() => {
    const timers = exitTimersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, []);

  const handlePreview = (file: AttachmentFile) => {
    if (onPreview) {
      onPreview(file);
      return;
    }

    if (isImageFile(file)) {
      setImgSrc(file.previewUrl || file.url);
      return;
    }

    openFileInNewWindow(file.previewUrl || file.url);
  };

  const handlePreviewClose = (visible: boolean) => {
    if (!visible) setImgSrc(undefined);
  };

  return (
    <div
      className={classNames(`${prefix}-container`, hashId, {
        [`${prefix}-container-empty`]: !hasFiles,
      })}
      data-testid={dataTestId}
    >
      {/* 列表整体入场淡入由 CSS 控制（参见 style.ts 的 -motion-fade-in）。
          子项的入场 stagger（每项 0.1s 延迟，等价 staggerChildren）+
          退出动画（slide-out-up + 延迟卸载，等价 AnimatePresence + exit）
          由 renderEntries 状态机驱动，保留与 framer-motion 实现等价的视觉效果。 */}
      <div
        style={containerStyle}
        className={classNames(prefix, hashId, `${prefix}-motion-fade-in`)}
      >
        {hasFiles ? (
          <div
            className={classNames(`${prefix}-title`, hashId)}
            data-testid="attachment-list-title"
          >
            {locale?.['input.attachmentListTitle'] || '上传附件'}
          </div>
        ) : null}
        {renderEntries.map((entry) => (
          <AttachmentFileListItem
            prefixCls={`${prefix}-item`}
            hashId={hashId}
            className={classNames(hashId, `${prefix}-item`)}
            key={entry.key}
            file={entry.file}
            onDelete={onDelete}
            onPreview={onPreview ?? handlePreview}
            onDownload={onDownload}
            onRetry={onRetry}
            motionState={entry.state}
            motionDelaySec={
              entry.state === 'enter'
                ? entry.index * ATTACHMENT_ITEM_STAGGER_S
                : 0
            }
          />
        ))}
        <Image
          key="preview"
          src={imgSrc}
          alt="Preview"
          style={IMAGE_PREVIEW_STYLE}
          preview={{
            visible: !!imgSrc,
            scaleStep: 1,
            src: imgSrc,
            onVisibleChange: handlePreviewClose,
          }}
        />
      </div>
      <ClearButton
        visible={canShowClearButton}
        onClick={onClearFileMap}
        className={classNames(`${prefix}-close-icon`, hashId)}
      />
    </div>
  );
};
