import {
  AudioOutlined,
  FileImageOutlined,
  FileTextFilled,
  FolderOpenOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { LocalKeys } from '../../I18n';
import { compileTemplate, I18nContext } from '../../I18n';
import { isMobileDevice, isVivoOrOppoDevice, kbToSize } from './utils';

export type SupportedFormat = {
  type: string;
  maxSize: number;
  extensions: string[];
  icon: React.ReactNode;
  content?: React.ReactNode;
};

export type AttachmentButtonPopoverProps = {
  children?: React.ReactNode;
  supportedFormat?: SupportedFormat;
  /** 上传图片的处理函数 */
  uploadImage?: (forGallery?: boolean) => Promise<void>;
  /** 国际化文案，可覆盖 I18n 上下文中的配置。支持 `input.openGallery`、`input.openFile`、`input.supportedFormatMessage`（模板变量：${maxSize}、${extensions}）等 */
  locale?: Partial<LocalKeys>;
};

const FILE_SIZE_UNITS = {
  KB: 1024,
  MB: 1024 * 1024,
};

const DEFAULT_MAX_SIZE = 5000;

const CONTENT_STYLE: React.CSSProperties = {
  fontSize: 16,
  lineHeight: '1.5em',
  maxWidth: 275,
};

export const SupportedFileFormats = {
  image: {
    icon: <FileImageOutlined />,
    type: '图片',
    maxSize: 10 * FILE_SIZE_UNITS.KB,
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
  },
  document: {
    icon: <FileTextFilled />,
    type: '文档',
    maxSize: 10 * FILE_SIZE_UNITS.KB,
    extensions: [
      'pdf',
      'markdown',
      'ppt',
      'html',
      'xls',
      'xlsx',
      'cs',
      'docx',
      'pptx',
      'xml',
    ],
  },
  audio: {
    icon: <AudioOutlined />,
    type: '音频',
    maxSize: 50 * FILE_SIZE_UNITS.KB,
    extensions: ['mp3', 'wav'],
  },
  video: {
    icon: <VideoCameraOutlined />,
    type: '视频',
    maxSize: 100 * FILE_SIZE_UNITS.KB,
    extensions: ['mp4', 'avi', 'mov'],
  },
};

const DEFAULT_FORMAT_MESSAGE =
  '支持上传文件，每个文件不超过 ${maxSize}，支持 ${extensions}等格式。';

const buildFormatMessage = (
  format: SupportedFormat,
  locale?: Partial<LocalKeys>,
) => {
  const maxSize = kbToSize(format.maxSize || DEFAULT_MAX_SIZE);
  const extensions = format.extensions?.join(', ') || '';
  const template =
    locale?.['input.supportedFormatMessage'] ?? DEFAULT_FORMAT_MESSAGE;
  return compileTemplate(template, { maxSize, extensions });
};

const FormatContent: React.FC<{
  format: SupportedFormat;
  locale?: Partial<LocalKeys>;
}> = ({ format, locale }) => {
  if (format.content) return <>{format.content}</>;

  return <div style={CONTENT_STYLE}>{buildFormatMessage(format, locale)}</div>;
};

export const AttachmentSupportedFormatsContent: React.FC<
  AttachmentButtonPopoverProps
> = ({ supportedFormat, locale }) => {
  const format = supportedFormat || SupportedFileFormats.image;
  return <FormatContent format={format} locale={locale} />;
};

export const AttachmentButtonPopover: React.FC<
  AttachmentButtonPopoverProps
> = ({ children, supportedFormat, uploadImage, locale: localeProp }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { locale: contextLocale } = useContext(I18nContext);
  const locale =
    localeProp !== undefined
      ? { ...contextLocale, ...localeProp }
      : contextLocale;
  const isVivoOrOppo = useMemo(() => isVivoOrOppoDevice(), []);
  const isMobile = useMemo(() => isMobileDevice(), []);
  const trigger = useMemo(
    () =>
      isVivoOrOppo
        ? ['click' as const]
        : (['hover', 'click'] as ('hover' | 'click')[]),
    [isVivoOrOppo],
  );

  const handleClick = useRefFunction((e: React.MouseEvent) => {
    if (isVivoOrOppo) {
      e.stopPropagation();
      e.preventDefault();
      setModalOpen(true);
    }
  });

  const handleOpenGallery = useRefFunction(() => {
    uploadImage?.(true);
    setModalOpen(false);
  });

  const handleOpenFile = useRefFunction(() => {
    uploadImage?.(false);
    setModalOpen(false);
  });

  if (isVivoOrOppo) {
    return (
      <div
        onClick={(e) => {
          if (isVivoOrOppo) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        <span onClick={handleClick}>{children}</span>
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          closable={false}
          maskClosable={true}
          centered
          styles={{
            content: {
              padding: 0,
            },
            body: {
              padding: 0,
            },
          }}
          width={120}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '12px 0',
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Button
              color="default"
              variant="text"
              icon={<PictureOutlined />}
              onClick={handleOpenGallery}
            >
              {locale?.['input.openGallery'] || '打开相册'}
            </Button>
            <Button
              color="default"
              variant="text"
              icon={<FolderOpenOutlined />}
              onClick={handleOpenFile}
            >
              {locale?.['input.openFile'] || '打开文件'}
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // 如果是移动设备，不显示 Tooltip
  if (isMobile) {
    return <span>{children}</span>;
  }

  return (
    <Tooltip
      arrow={false}
      mouseEnterDelay={1}
      trigger={trigger}
      title={
        <AttachmentSupportedFormatsContent
          supportedFormat={supportedFormat}
          locale={locale}
        />
      }
    >
      <span
        onClick={(e) => {
          if (isVivoOrOppo) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        {children}
      </span>
    </Tooltip>
  );
};

export default AttachmentButtonPopover;
