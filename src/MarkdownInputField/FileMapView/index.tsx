import { FileSearch } from '@sofa-design/icons';
import { ConfigProvider, Image } from 'antd';
import classNames from 'clsx';
import { motion } from 'framer-motion';
import React, { useContext, useMemo, useState } from 'react';
import { AttachmentFile } from '../AttachmentButton/types';
import { isImageFile } from '../AttachmentButton/utils';
import { FileMapViewItem } from './FileMapViewItem';
import { useStyle } from './style';

export type FileMapViewProps = {
  /** 是否显示"查看更多"按钮 */
  showMoreButton?: boolean;
  /** 文件映射表 */
  fileMap?: Map<string, AttachmentFile>;
  /** 预览文件回调 */
  onPreview?: (file: AttachmentFile) => void;
  /** 下载文件回调 */
  onDownload?: (file: AttachmentFile) => void;
  /** 点击"查看所有文件"回调，携带当前所有文件列表。返回 true 时组件内部展开所有文件，返回 false 时由外部处理 */
  onViewAll?: (files: AttachmentFile[]) => boolean | Promise<boolean>;
  /** 自定义更多操作 DOM（优先于 onMore，传入则展示该 DOM，不传则不展示更多按钮） */
  renderMoreAction?: (file: AttachmentFile) => React.ReactNode;
  /** 自定义悬浮动作区 slot（传入则覆盖默认『预览/下载/更多』动作区） */
  customSlot?: React.ReactNode | ((file: AttachmentFile) => React.ReactNode);
  /** 自定义根容器样式（可覆盖布局，如 flexDirection、gap、wrap 等） */
  style?: React.CSSProperties;
  /** 自定义根容器类名 */
  className?: string;
  /** 最多展示的非图片文件数量，传入则开启溢出控制并在超出时显示"查看所有文件"按钮，不传则展示所有文件且不显示按钮 */
  maxDisplayCount?: number;
  placement?: 'left' | 'right';
};

/**
 * FileMapView 组件 - 文件映射视图组件
 *
 * 该组件用于显示文件列表，支持图片预览、文件下载、文件预览等功能。
 * 根据文件类型提供不同的显示方式，图片文件以网格形式显示，其他文件以列表形式显示。
 *
 * @component
 * @description 文件映射视图组件，显示文件列表和预览功能
 * @param {FileMapViewProps} props - 组件属性
 * @param {Map<string, AttachmentFile>} props.fileMap - 文件映射表
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {(file: AttachmentFile) => void} [props.onFileClick] - 文件点击回调
 * @param {(file: AttachmentFile) => void} [props.onPreview] - 文件预览回调
 * @param {(file: AttachmentFile) => void} [props.onDownload] - 文件下载回调
 * @param {boolean} [props.collapsible] - 是否可折叠
 * @param {number} [props.maxDisplayCount] - 最大显示数量
 *
 * @example
 * ```tsx
 * <FileMapView
 *   fileMap={fileMap}
 *   onFileClick={(file) => console.log('点击文件', file)}
 *   onPreview={(file) => console.log('预览文件', file)}
 *   onDownload={(file) => console.log('下载文件', file)}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的文件映射视图组件
 *
 * @remarks
 * - 支持图片文件的网格预览
 * - 支持其他文件类型的列表显示
 * - 提供文件预览和下载功能
 * - 支持文件列表折叠
 * - 提供动画效果
 * - 自动识别文件类型
 * - 支持自定义样式和交互
 */
export const FileMapView: React.FC<FileMapViewProps> = (props) => {
  const { placement = 'left' } = props;
  const context = useContext(ConfigProvider.ConfigContext);
  const prefix = context?.getPrefixCls('agentic-md-editor-file-view-list');
  const { wrapSSR, hashId } = useStyle(prefix);
  const [showAllFiles, setShowAllFiles] = useState(false);

  const fileList = useMemo(() => {
    if (!props.fileMap) {
      return [];
    }
    return Array.from(props.fileMap?.values() || []);
  }, [props.fileMap]);

  // 图片列表不受 maxDisplayCount 限制，显示所有图片
  const imgList = useMemo(() => {
    return fileList.filter((file) => isImageFile(file));
  }, [fileList]);

  // 所有非图片文件列表
  const allNoImageFiles = useMemo(() => {
    return fileList.filter((file) => !isImageFile(file));
  }, [fileList]);

  // 根据 maxDisplayCount 限制显示的非图片文件列表
  const noImageFileList = useMemo(() => {
    // 如果已展开所有文件，或者未设置最大显示数量，则显示所有文件
    if (showAllFiles || props.maxDisplayCount === undefined) {
      return allNoImageFiles;
    }
    return allNoImageFiles.slice(0, Math.max(0, props.maxDisplayCount));
  }, [allNoImageFiles, props.maxDisplayCount, showAllFiles]);

  const handleViewAllClick = async () => {
    if (props.onViewAll) {
      const shouldExpand = await props.onViewAll(fileList);
      if (shouldExpand) {
        setShowAllFiles(true);
      }
    } else {
      // 如果没有提供 onViewAll 回调，默认展开所有文件
      setShowAllFiles(true);
    }
  };

  return wrapSSR(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxWidth: '100%',
        minWidth: 0,
        alignItems: placement === 'left' ? 'flex-start' : 'flex-end',
        width: 'max-content',
      }}
    >
      <motion.div
        variants={{
          visible: {
            opacity: 1,
            transition: {
              when: 'beforeChildren',
              staggerChildren: 0.1,
            },
          },
          hidden: {
            opacity: 0,
            transition: {
              when: 'afterChildren',
            },
          },
        }}
        whileInView="visible"
        initial="hidden"
        animate={'visible'}
        style={props.style}
        className={classNames(
          prefix,
          hashId,
          props.className,
          `${prefix}-${placement}`,
          {
            [`${prefix}-image-list-view`]: imgList.length > 1,
            [`${prefix}-image-list-view-${placement}`]: imgList.length > 1,
          },
        )}
      >
        <Image.PreviewGroup>
          {imgList.map((file, index) => {
            return (
              <Image
                rootClassName={classNames(`${prefix}-image`, hashId)}
                width={124}
                height={124}
                src={file.previewUrl || file.url}
                key={file.uuid || file.name || index}
              />
            );
          })}
        </Image.PreviewGroup>
      </motion.div>
      <motion.div
        variants={{
          visible: {
            opacity: 1,
            transition: {
              when: 'beforeChildren',
              staggerChildren: 0.1,
            },
          },
          hidden: {
            opacity: 0,
            transition: {
              when: 'afterChildren',
            },
          },
        }}
        whileInView="visible"
        initial="hidden"
        animate={'visible'}
        className={classNames(
          prefix,
          hashId,
          props.className,
          `${prefix}-${placement}`,
          `${prefix}-vertical`,
        )}
        style={props.style}
      >
        {noImageFileList.map((file, index) => {
          return (
            <FileMapViewItem
              style={{ width: props.style?.width }}
              onPreview={
                props.onPreview
                  ? () => {
                      props.onPreview?.(file);
                    }
                  : undefined
              }
              onDownload={
                props.onDownload
                  ? () => {
                      props.onDownload?.(file);
                    }
                  : undefined
              }
              renderMoreAction={props.renderMoreAction}
              customSlot={props.customSlot}
              key={file?.uuid || file?.name || index}
              prefixCls={`${prefix}-item`}
              hashId={hashId}
              className={classNames(hashId, `${prefix}-item`)}
              file={file}
            />
          );
        })}
        {props.maxDisplayCount !== undefined &&
        allNoImageFiles.length > props.maxDisplayCount &&
        !showAllFiles ? (
          <div
            style={{ width: props.style?.width }}
            className={classNames(hashId, `${prefix}-more-file-container`)}
            onClick={handleViewAllClick}
          >
            <FileSearch color="var(--color-gray-text-secondary)" />
            <div className={classNames(hashId, `${prefix}-more-file-name`)}>
              <span style={{ whiteSpace: 'nowrap' }}>
                查看此任务中的所有文件
              </span>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>,
  );
};
