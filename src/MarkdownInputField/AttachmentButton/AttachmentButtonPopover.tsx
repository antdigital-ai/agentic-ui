import {
  AudioOutlined,
  FileImageOutlined,
  FileTextFilled,
  FolderOpenOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Modal, Popover, Tooltip } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { LocalKeys } from '../../I18n';
import { compileTemplate, I18nContext } from '../../I18n';
import { isMobileDevice, isVivoOrOppoDevice } from './utils';

export type SupportedFormat = {
  type: string;
  extensions: string[];
  icon: React.ReactNode;
  content?: React.ReactNode;
};

export type AttachmentButtonPopoverProps = {
  children?: React.ReactNode;
  supportedFormat?: SupportedFormat;
  /** 上传图片的处理函数 */
  uploadImage?: (forGallery?: boolean) => Promise<void>;
  /** 国际化文案，可覆盖 I18n 上下文中的配置。支持 `input.openGallery`、`input.openFile`、`input.supportedFormatMessage`（模板变量：${extensions}）等 */
  locale?: Partial<LocalKeys>;
};

const CONTENT_STYLE: React.CSSProperties = {
  fontSize: 16,
  lineHeight: '1.5em',
  maxWidth: 275,
};

export const SupportedFileFormats = {
  image: {
    icon: <FileImageOutlined />,
    type: 'image',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
  },
  document: {
    icon: <FileTextFilled />,
    type: 'document',
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
    type: 'audio',
    extensions: ['mp3', 'wav'],
  },
  video: {
    icon: <VideoCameraOutlined />,
    type: 'video',
    extensions: ['mp4', 'avi', 'mov'],
  },
};

const DEFAULT_FORMAT_MESSAGE = 'Supports ${extensions} formats.';

const buildFormatMessage = (
  format: SupportedFormat,
  locale?: Partial<LocalKeys>,
) => {
  const extensions = format.extensions?.join(', ') || '';
  const template =
    locale?.['input.supportedFormatMessage'] ?? DEFAULT_FORMAT_MESSAGE;
  return compileTemplate(template, { extensions });
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
              {locale?.['input.openGallery'] || 'Open Gallery'}
            </Button>
            <Button
              color="default"
              variant="text"
              icon={<FolderOpenOutlined />}
              onClick={handleOpenFile}
            >
              {locale?.['input.openFile'] || 'Open File'}
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // 移动设备无稳定 hover：用点击 Popover 展示支持格式说明（vivo/oppo 仍走上方 Modal）
  if (isMobile) {
    return (
      <Popover
        trigger="click"
        placement="top"
        arrow={false}
        content={
          <AttachmentSupportedFormatsContent
            supportedFormat={supportedFormat}
            locale={locale}
          />
        }
      >
        <span style={{ display: 'inline-flex' }}>{children}</span>
      </Popover>
    );
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
