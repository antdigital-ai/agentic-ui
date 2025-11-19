import {
  AudioOutlined,
  FileImageOutlined,
  FileTextFilled,
  FolderOpenOutlined,
  PictureOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { I18nContext } from '../../I18n';
import {
  isMobileDevice,
  isVivoOrOppoDevice,
  isWeChat,
  kbToSize,
} from './utils';

/**
 * 移动设备默认的文件类型 accept 值
 */
const MOBILE_DEFAULT_ACCEPT =
  'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,.csv,text/plain,application/x-zip-compressed';

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
  /** 文件选择后的回调函数，参数为选中的文件 */
  onFileSelect?: (files: FileList, accept: string) => void;
  /** 是否允许一次选择多个文件 */
  allowMultiple?: boolean;
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

const buildFormatMessage = (format: SupportedFormat) => {
  const maxSize = kbToSize(format.maxSize || DEFAULT_MAX_SIZE);
  const extensions = format.extensions?.join(', ') || '';
  return `支持上传文件，每个文件不超过 ${maxSize}，支持 ${extensions}等格式。`;
};

const FormatContent: React.FC<{ format: SupportedFormat }> = ({ format }) => {
  if (format.content) return <>{format.content}</>;

  return <div style={CONTENT_STYLE}>{buildFormatMessage(format)}</div>;
};

export const AttachmentSupportedFormatsContent: React.FC<
  AttachmentButtonPopoverProps
> = ({ supportedFormat }) => {
  const format = supportedFormat || SupportedFileFormats.image;
  return <FormatContent format={format} />;
};

export const AttachmentButtonPopover: React.FC<
  AttachmentButtonPopoverProps
> = ({ children, supportedFormat, onFileSelect, allowMultiple = true }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { locale } = useContext(I18nContext);
  const isVivoOrOppo = useMemo(() => isVivoOrOppoDevice(), []);
  const isMobile = useMemo(() => isMobileDevice(), []);
  const isWeChatEnv = useMemo(() => isWeChat(), []);
  const trigger = useMemo(
    () =>
      isVivoOrOppo
        ? ['click' as const]
        : (['hover', 'click'] as ('hover' | 'click')[]),
    [isVivoOrOppo],
  );

  const format = supportedFormat || SupportedFileFormats.image;
  const extensions = format.extensions || [];

  /**
   * 根据支持的格式获取 accept 属性值
   */
  const getAcceptValue = useRefFunction((forGallery: boolean): string => {
    // 如果是移动设备，返回默认的 accept 值
    if (isMobile || forGallery || isWeChatEnv) {
      return '';
    }

    // 打开文件，使用具体扩展名列表
    return extensions.length > 0
      ? extensions.map((ext) => `.${ext}`).join(',')
      : MOBILE_DEFAULT_ACCEPT;
  });

  /**
   * 创建文件输入并触发选择
   */
  const triggerFileInput = useRefFunction((forGallery: boolean) => {
    const accept = getAcceptValue(forGallery);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = allowMultiple;
    input.style.display = 'none';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0 && onFileSelect) {
        onFileSelect(target.files, accept);
      }
      // 清理
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
    setModalOpen(false);
  });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isVivoOrOppo) {
        e.stopPropagation();
        e.preventDefault();
        setModalOpen(true);
      }
    },
    [isVivoOrOppo],
  );

  const handleOpenGallery = useCallback(() => {
    triggerFileInput(true);
  }, [triggerFileInput]);

  const handleOpenFile = useCallback(() => {
    triggerFileInput(false);
  }, [triggerFileInput]);

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
        <AttachmentSupportedFormatsContent supportedFormat={supportedFormat} />
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
