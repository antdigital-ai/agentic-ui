import { X } from '@sofa-design/icons';
import { ConfigProvider, Image } from 'antd';
import classNames from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext } from 'react';
import { ActionIconBox } from '../../../Components/ActionIconBox';
import { AttachmentFile } from '../types';
import { isImageFile } from '../utils';
import { AttachmentFileListItem } from './AttachmentFileListItem';
import { useStyle } from './style';

export type AttachmentFileListProps = {
  fileMap?: Map<string, AttachmentFile>;
  onDelete: (file: AttachmentFile) => void;
  onPreview?: (file: AttachmentFile) => void;
  onDownload?: (file: AttachmentFile) => void;
  onRetry?: (file: AttachmentFile) => void;
  onClearFileMap?: () => void;
};

const ANIMATION_VARIANTS = {
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

const getFileKey = (file: AttachmentFile, index: number) => {
  return file?.uuid || file?.name || index;
};

const openFileInNewWindow = (url?: string) => {
  if (typeof window === 'undefined' || !url) return;
  window.open(url, '_blank');
};

const ClearButton: React.FC<{
  visible: boolean;
  opacity: number;
  onClick?: () => void;
  className: string;
}> = ({ visible, opacity, onClick, className }) => {
  if (!visible) return null;

  return (
    <ActionIconBox
      style={{ transition: CLEAR_BUTTON_TRANSITION, opacity }}
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
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const prefix = context?.getPrefixCls('agentic-md-editor-attachment-list');
  const { wrapSSR, hashId } = useStyle(prefix);
  const [imgSrc, setImgSrc] = React.useState<string | undefined>(undefined);

  const fileList = Array.from(fileMap?.values() || []);
  const fileCount = fileMap?.size || 0;
  const hasFiles = fileList.length > 0;
  const isAnyUploading = fileList.some((file) => file.status === 'uploading');
  const canShowClearButton = !isAnyUploading;
  const containerStyle = fileCount ? {} : HIDDEN_STYLE;
  const clearButtonOpacity = fileCount ? 1 : 0;

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

  const handleDelete = (file: AttachmentFile) => () => onDelete(file);
  const handlePreviewFile = (file: AttachmentFile) => () => handlePreview(file);
  const handleDownload = (file: AttachmentFile) => () => onDownload?.(file);
  const handleRetry = (file: AttachmentFile) => () => onRetry?.(file);

  return wrapSSR(
    <div
      className={classNames(`${prefix}-container`, hashId, {
        [`${prefix}-container-empty`]: !hasFiles,
      })}
    >
      <motion.div
        variants={ANIMATION_VARIANTS}
        whileInView="visible"
        initial="hidden"
        animate="visible"
        style={containerStyle}
        className={classNames(prefix, hashId)}
      >
        <AnimatePresence initial={false}>
          {fileList.map((file, index) => (
            <AttachmentFileListItem
              prefixCls={`${prefix}-item`}
              hashId={hashId}
              className={classNames(hashId, `${prefix}-item`)}
              key={getFileKey(file, index)}
              file={file}
              onDelete={handleDelete(file)}
              onPreview={handlePreviewFile(file)}
              onDownload={handleDownload(file)}
              onRetry={handleRetry(file)}
            />
          ))}
        </AnimatePresence>
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
      </motion.div>
      <ClearButton
        visible={canShowClearButton}
        opacity={clearButtonOpacity}
        onClick={onClearFileMap}
        className={classNames(`${prefix}-close-icon`, hashId)}
      />
    </div>,
  );
};
