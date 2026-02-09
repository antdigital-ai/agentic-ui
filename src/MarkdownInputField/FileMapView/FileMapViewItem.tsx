import { Download, EllipsisVertical, Eye } from '@sofa-design/icons';
import { Tooltip } from 'antd';
import classNames from 'clsx';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { AttachmentFileIcon } from '../AttachmentButton/AttachmentFileList/AttachmentFileIcon';
import { AttachmentFile } from '../AttachmentButton/types';
import { kbToSize } from '../AttachmentButton/utils';

/**
 * FileMapViewItem 组件 - 文件映射视图项组件
 *
 * 该组件用于显示单个文件项，包括文件图标、文件名、文件大小等信息。
 * 支持文件预览和下载操作，提供动画效果和工具提示。
 *
 * @component
 * @description 文件映射视图项组件，显示单个文件信息
 * @param {Object} props - 组件属性
 * @param {AttachmentFile} props.file - 文件对象
 * @param {() => void} props.onPreview - 预览文件回调
 * @param {() => void} props.onDownload - 下载文件回调
 * @param {string} [props.className] - 自定义CSS类名
 * @param {string} [props.prefixCls] - 前缀类名
 * @param {string} [props.hashId] - 哈希ID
 *
 * @example
 * ```tsx
 * <FileMapViewItem
 *   file={fileData}
 *   onPreview={() => handlePreview(fileData)}
 *   onDownload={() => handleDownload(fileData)}
 *   className="custom-file-item"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的文件映射视图项组件
 *
 * @remarks
 * - 显示文件图标、名称和大小
 * - 支持文件预览和下载操作
 * - 提供动画效果
 * - 显示工具提示
 * - 自动处理文件状态
 * - 支持自定义样式
 */
export const FileMapViewItem: React.FC<{
  file: AttachmentFile;
  onPreview?: () => void;
  onDownload?: () => void;
  renderMoreAction?: (file: AttachmentFile) => React.ReactNode;
  customSlot?: React.ReactNode | ((file: AttachmentFile) => React.ReactNode);
  className?: string;
  prefixCls?: string;
  hashId?: string;
  style?: React.CSSProperties;
}> = (props) => {
  const file = props.file;
  const { locale } = useContext(I18nContext);
  const [hovered, setHovered] = React.useState(false);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);
  const fileName = file?.name ?? '';
  const lastDotIndex = fileName.lastIndexOf('.');
  const displayName =
    lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
  const displayExtension =
    lastDotIndex > 0 && lastDotIndex < fileName.length - 1
      ? fileName.slice(lastDotIndex + 1)
      : '';
  return (
    <Tooltip
      title={<div>{locale?.clickToPreview}</div>}
      placement="topLeft"
      arrow={false}
    >
      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (file.status === 'error') return;
          if (props.onPreview) {
            props.onPreview?.();
          } else {
            // 默认行为：在新窗口打开文件
            if (typeof window === 'undefined') return;
            window.open(file.previewUrl || file.url, '_blank');
          }
        }}
        variants={{
          hidden: { x: 20, opacity: 0 },
          visible: { x: 0, opacity: 1 },
          exit: { x: -20, opacity: 0 },
        }}
        exit={{ opacity: 0, x: -20 }}
        className={props.className}
        data-testid="file-item"
      >
        <div
          className={classNames(`${props.prefixCls}-file-icon`, props.hashId)}
        >
          <AttachmentFileIcon
            file={file}
            className={classNames(
              `${props.prefixCls}-file-icon-img`,
              props.hashId,
            )}
          />
        </div>
        <div
          className={classNames(`${props.prefixCls}-file-info`, props.hashId)}
        >
          <div
            className={classNames(`${props.prefixCls}-file-name`, props.hashId)}
          >
            <span
              className={classNames(
                `${props.prefixCls}-file-name-text`,
                props.hashId,
              )}
              title={file?.name}
            >
              {displayName}
            </span>
          </div>
          <div
            className={classNames(
              `${props.prefixCls}-file-name-extension-container`,
              props.hashId,
            )}
          >
            <span
              className={classNames(
                `${props.prefixCls}-file-name-extension`,
                props.hashId,
              )}
            >
              {displayExtension}
            </span>
            <span
              className={classNames(
                `${props.prefixCls}-separator`,
                props.hashId,
              )}
            >
              |
            </span>
            <div
              className={classNames(
                `${props.prefixCls}-file-size`,
                props.hashId,
              )}
            >
              {kbToSize(file.size / 1024)}
            </div>
            <span
              className={classNames(
                `${props.prefixCls}-separator`,
                props.hashId,
              )}
            >
              |
            </span>
            <div>
              {file?.lastModified
                ? dayjs(file?.lastModified).format('HH:mm')
                : ''}
            </div>
          </div>
        </div>

        {hovered ? (
          <div
            className={classNames(
              `${props.prefixCls}-action-bar`,
              props.hashId,
            )}
          >
            {props.customSlot ? (
              <ActionIconBox
                title={'更多'}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={classNames(
                  `${props.prefixCls}-action-btn`,
                  props.hashId,
                )}
              >
                {typeof props.customSlot === 'function'
                  ? (props.customSlot(file) as any)
                  : (props.customSlot as any)}
              </ActionIconBox>
            ) : (
              <>
                <ActionIconBox
                  title={locale?.preview || '预览'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (props.onPreview) {
                      props.onPreview?.();
                    } else {
                      // 默认行为：在新窗口打开文件
                      if (typeof window === 'undefined') return;
                      window.open(file.previewUrl || file.url, '_blank');
                    }
                  }}
                  className={classNames(
                    `${props.prefixCls}-action-btn`,
                    props.hashId,
                  )}
                >
                  <Eye color="var(--color-gray-text-secondary)" />
                </ActionIconBox>
                {props.onDownload && (
                  <ActionIconBox
                    title={locale?.download || '下载'}
                    onClick={(e) => {
                      e.stopPropagation();
                      props.onDownload?.();
                    }}
                    className={classNames(
                      `${props.prefixCls}-action-btn`,
                      props.hashId,
                    )}
                  >
                    <Download color="var(--color-gray-text-secondary)" />
                  </ActionIconBox>
                )}
                {props.renderMoreAction && (
                  <ActionIconBox
                    title="更多操作"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={classNames(
                      `${props.prefixCls}-action-btn`,
                      props.hashId,
                    )}
                  >
                    <EllipsisVertical
                      style={{ color: 'var(--color-gray-text-secondary)' }}
                    />
                    <div
                      className={classNames(
                        `${props.prefixCls}-more-custom`,
                        props.hashId,
                      )}
                    >
                      {props.renderMoreAction(file)}
                    </div>
                  </ActionIconBox>
                )}
              </>
            )}
          </div>
        ) : null}
      </motion.div>
    </Tooltip>
  );
};
