import {
  AudioOutlined,
  FileImageOutlined,
  FileTextFilled,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Popover, Tooltip } from 'antd';
import React, { useContext, useMemo } from 'react';
import type { LocalKeys } from '../../I18n';
import { compileTemplate, I18nContext } from '../../I18n';
import { isMobileDevice } from './utils';

export type SupportedFormat = {
  type: string;
  extensions: string[];
  icon: React.ReactNode;
  content?: React.ReactNode;
};

export type AttachmentButtonPopoverProps = {
  children?: React.ReactNode;
  supportedFormat?: SupportedFormat;
  /**
   * @deprecated 上传动作由 AttachmentButton 外层点击统一触发；
   * 该组件仅展示支持格式提示。
   */
  uploadImage?: (forGallery?: boolean) => Promise<void>;
  /** 国际化文案，可覆盖 I18n 上下文中的配置。支持 `input.supportedFormatMessage`（模板变量：${extensions}） */
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
> = ({ children, supportedFormat, locale: localeProp }) => {
  const { locale: contextLocale } = useContext(I18nContext);
  const locale =
    localeProp !== undefined
      ? { ...contextLocale, ...localeProp }
      : contextLocale;
  const isMobile = useMemo(() => isMobileDevice(), []);

  // 移动设备无稳定 hover：点击时展示支持格式说明；上传仍由外层 click 统一触发。
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
      trigger="hover"
      title={
        <AttachmentSupportedFormatsContent
          supportedFormat={supportedFormat}
          locale={locale}
        />
      }
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default AttachmentButtonPopover;
