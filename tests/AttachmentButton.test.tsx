import { AttachmentFile, isImageFile } from '@ant-design/agentic-ui';
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { message } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AttachmentButton,
  upLoadFileToServer,
} from '../src/MarkdownInputField/AttachmentButton';

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      loading: vi.fn(() => vi.fn()),
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('AttachmentButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isImageFile function', () => {
    it('should return true for image files by extension', () => {
      const svgFile = new File(['<svg></svg>'], 'test.svg', {
        type: 'image/svg+xml',
      }) as AttachmentFile;
      expect(isImageFile(svgFile)).toBe(true);
    });

    it('should return true for image files by MIME type', () => {
      const jpgFile = new File(['jpg content'], 'test.jpg', {
        type: 'image/jpeg',
      }) as AttachmentFile;
      const pngFile = new File(['png content'], 'test.png', {
        type: 'image/png',
      }) as AttachmentFile;
      const gifFile = new File(['gif content'], 'test.gif', {
        type: 'image/gif',
      }) as AttachmentFile;

      expect(isImageFile(jpgFile)).toBe(true);
      expect(isImageFile(pngFile)).toBe(true);
      expect(isImageFile(gifFile)).toBe(true);
    });

    it('should return false for non-image files', () => {
      const textFile = new File(['text content'], 'test.txt', {
        type: 'text/plain',
      }) as AttachmentFile;
      const pdfFile = new File(['pdf content'], 'test.pdf', {
        type: 'application/pdf',
      }) as AttachmentFile;

      expect(isImageFile(textFile)).toBe(false);
      expect(isImageFile(pdfFile)).toBe(false);
    });

    it('should handle files with undefined name/type', () => {
      const fileWithoutType = new File(['content'], 'test.txt', {
        type: '',
      }) as AttachmentFile;
      const fileWithoutName = new File(['content'], '', {
        type: 'text/plain',
      }) as AttachmentFile;

      expect(isImageFile(fileWithoutType)).toBe(false);
      expect(isImageFile(fileWithoutName)).toBe(false);
    });
  });

  describe('upLoadFileToServer function', () => {
    const mockUpload = vi.fn();
    const mockOnFileMapChange = vi.fn();

    beforeEach(() => {
      mockUpload.mockClear();
      mockOnFileMapChange.mockClear();
      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
    });

    it('should upload files successfully', async () => {
      const mockFiles = [
        new File(['test'], 'test.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      mockUpload.mockResolvedValue('uploaded-url');

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
      });

      expect(mockUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.txt',
          status: 'done',
          url: 'uploaded-url',
        }),
        0, // index parameter
      );
      expect(mockOnFileMapChange).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('Upload success');
    });

    it('should handle upload errors', async () => {
      const mockFiles = [
        new File(['test'], 'test.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      mockUpload.mockRejectedValue(new Error('Upload failed'));

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
      });

      expect(message.error).toHaveBeenCalledWith('Upload failed');
    });

    it('should validate file count limits', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
        new File(['test2'], 'test2.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        maxFileCount: 1,
      });

      expect(message.error).toHaveBeenCalledWith('最多只能上传 1 个文件');
    });

    it('should validate total file count including existing files', async () => {
      // 创建已存在的文件
      const existingFile = new File(
        ['existing'],
        'existing.txt',
      ) as AttachmentFile;
      existingFile.uuid = 'existing-id';
      existingFile.status = 'done';

      const existingFileMap = new Map([['existing-id', existingFile]]);

      // 尝试上传 2 个新文件（已有 1 个 + 新上传 2 个 = 3 个，超过限制 2 个）
      const mockFiles = [
        new File(['test1'], 'test1.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
        new File(['test2'], 'test2.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        fileMap: existingFileMap,
        maxFileCount: 2,
      });

      // 应该显示错误，因为总数 3 超过了限制 2
      expect(message.error).toHaveBeenCalledWith('最多只能上传 2 个文件');
      // upload 函数不应该被调用
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should allow upload when total file count is within limit', async () => {
      // 创建已存在的文件
      const existingFile = new File(
        ['existing'],
        'existing.txt',
      ) as AttachmentFile;
      existingFile.uuid = 'existing-id';
      existingFile.status = 'done';

      const existingFileMap = new Map([['existing-id', existingFile]]);

      // 尝试上传 1 个新文件（已有 1 个 + 新上传 1 个 = 2 个，不超过限制 3 个）
      const mockFiles = [
        new File(['test1'], 'test1.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      mockUpload.mockResolvedValue('uploaded-url');

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        fileMap: existingFileMap,
        maxFileCount: 3,
      });

      // 不应该显示错误
      expect(message.error).not.toHaveBeenCalledWith(
        expect.stringContaining('最多只能上传'),
      );
      // upload 函数应该被调用
      expect(mockUpload).toHaveBeenCalled();
    });

    it('should validate minimum file count', async () => {
      const mockFiles = [
        new File(['test'], 'test.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        minFileCount: 2,
      });

      expect(message.error).toHaveBeenCalledWith('至少需要上传 2 个文件');
    });

    it('should validate file size limits', async () => {
      const mockFiles = [
        new File(['test'], 'large-file.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      // Mock file size
      Object.defineProperty(mockFiles[0], 'size', { value: 2048 });

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        maxFileSize: 1024, // 1KB limit
      });

      expect(message.error).toHaveBeenCalledWith('文件大小超过 1 KB');
      // upload 函数不应该被调用，因为文件大小超限
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('should allow upload when file size is within limit', async () => {
      const mockFiles = [
        new File(['test'], 'small-file.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      // Mock file size - 小于限制
      Object.defineProperty(mockFiles[0], 'size', { value: 512 });

      mockUpload.mockResolvedValue('uploaded-url');

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        maxFileSize: 1024, // 1KB limit
      });

      // 不应该显示错误
      expect(message.error).not.toHaveBeenCalledWith(
        expect.stringContaining('文件大小超过'),
      );
      // upload 函数应该被调用
      expect(mockUpload).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('Upload success');
    });

    it('should allow upload when file size equals the limit', async () => {
      const mockFiles = [
        new File(['test'], 'exact-size-file.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      // Mock file size - 等于限制
      Object.defineProperty(mockFiles[0], 'size', { value: 1024 });

      mockUpload.mockResolvedValue('uploaded-url');

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        maxFileSize: 1024, // 1KB limit
      });

      // 不应该显示错误
      expect(message.error).not.toHaveBeenCalledWith(
        expect.stringContaining('文件大小超过'),
      );
      // upload 函数应该被调用
      expect(mockUpload).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('Upload success');
    });

    it('should handle image files with preview URL', async () => {
      const mockFiles = [
        new File(['test'], 'test.jpg', {
          type: 'image/jpeg',
        }) as AttachmentFile,
      ];

      mockUpload.mockResolvedValue('uploaded-url');

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
      });

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFiles[0]);
    });

    it('should use existing fileMap if provided', async () => {
      const existingFile = new File(
        ['existing'],
        'existing.txt',
      ) as AttachmentFile;
      existingFile.uuid = 'existing-id';

      const existingFileMap = new Map([['existing-id', existingFile]]);

      const mockFiles = [
        new File(['test'], 'test.txt', {
          type: 'text/plain',
        }) as AttachmentFile,
      ];

      mockUpload.mockResolvedValue('uploaded-url');

      await upLoadFileToServer(mockFiles, {
        upload: mockUpload,
        onFileMapChange: mockOnFileMapChange,
        fileMap: existingFileMap,
      });

      expect(mockOnFileMapChange).toHaveBeenCalledWith(expect.any(Map));
    });
  });

  describe('AttachmentButton Component', () => {
    const mockUploadImage = vi.fn();

    it('should render attachment button', () => {
      render(<AttachmentButton uploadImage={mockUploadImage} />);

      // Look for the attachment button by class
      const attachmentButton = document.querySelector(
        '.ant-agentic-md-editor-attachment-button',
      );
      expect(attachmentButton).toBeInTheDocument();
    });

    it('should handle click when not disabled', () => {
      const { container } = render(
        <AttachmentButton uploadImage={mockUploadImage} disabled={false} />,
      );

      const attachmentButton = container.firstChild as HTMLElement;
      fireEvent.click(attachmentButton);

      expect(mockUploadImage).toHaveBeenCalled();
    });

    it('should not handle click when disabled', () => {
      const { container } = render(
        <AttachmentButton uploadImage={mockUploadImage} disabled={true} />,
      );

      const attachmentButton = container.firstChild as HTMLElement;
      fireEvent.click(attachmentButton);

      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should apply disabled class when disabled', () => {
      const { container } = render(
        <AttachmentButton uploadImage={mockUploadImage} disabled={true} />,
      );

      const attachmentButton = container.firstChild;
      expect(attachmentButton).toHaveClass(
        'ant-agentic-md-editor-attachment-button-disabled',
      );
    });

    it('should use custom supported formats', () => {
      const customFormats = {
        icon: <span>Custom Icon</span>,
        type: 'Custom Type',
        maxSize: 5 * 1024,
        extensions: ['custom'],
      };

      render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          supportedFormat={customFormats}
        />,
      );

      // The component should render without errors
      const { container } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          supportedFormat={customFormats}
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle file upload with callbacks', async () => {
      const mockUpload = vi.fn().mockResolvedValue('uploaded-url');
      const mockOnFileMapChange = vi.fn();
      const mockOnDelete = vi.fn();
      const mockOnPreview = vi.fn();
      const mockOnDownload = vi.fn();

      const { container } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          upload={mockUpload}
          onFileMapChange={mockOnFileMapChange}
          onDelete={mockOnDelete}
          onPreview={mockOnPreview}
          onDownload={mockOnDownload}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle file size and count limits', () => {
      const { container } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          maxFileSize={1024}
          maxFileCount={5}
          minFileCount={1}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render with custom render function', () => {
      const CustomRender = ({ children, supportedFormat }: any) => (
        <div data-testid="custom-render" title={supportedFormat?.type}>
          {children}
        </div>
      );

      const { getByTestId } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={CustomRender}
        />,
      );

      expect(getByTestId('custom-render')).toBeInTheDocument();
    });

    it('should pass supportedFormat to custom render function', () => {
      const mockRender = vi.fn(({ children }) => (
        <div data-testid="custom-render">{children}</div>
      ));

      const customFormat = {
        icon: <span>Test Icon</span>,
        type: 'Test Type',
        maxSize: 1024,
        extensions: ['test'],
      };

      render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={mockRender}
          supportedFormat={customFormat}
        />,
      );

      expect(mockRender).toHaveBeenCalledWith({
        children: expect.anything(),
        supportedFormat: customFormat,
        locale: undefined,
      });
    });

    it('should pass locale to custom render function when locale prop is provided', () => {
      const mockRender = vi.fn(({ children }) => (
        <div data-testid="custom-render">{children}</div>
      ));

      const customLocale = {
        'input.openGallery': 'Open Gallery',
        'input.openFile': 'Open File',
      };

      render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={mockRender}
          locale={customLocale}
        />,
      );

      expect(mockRender).toHaveBeenCalledWith({
        children: expect.anything(),
        supportedFormat: expect.anything(),
        locale: customLocale,
      });
    });

    it('should render without error when locale is provided and render is not used', () => {
      const { container } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          locale={{
            'input.openGallery': 'Open Gallery',
            'input.openFile': 'Open File',
          }}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(
        document.querySelector('.ant-agentic-md-editor-attachment-button'),
      ).toBeInTheDocument();
    });

    it('should render Paperclip icon in custom render function', () => {
      const CustomRender = ({ children }: any) => (
        <div data-testid="custom-render">{children}</div>
      );

      const { getByTestId } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={CustomRender}
        />,
      );

      const customRender = getByTestId('custom-render');
      expect(customRender).toBeInTheDocument();
      // Verify that the Paperclip icon is passed as children
      expect(customRender.children.length).toBeGreaterThan(0);
    });

    it('should fallback to default AttachmentButtonPopover when render is not provided', () => {
      const { container } = render(
        <AttachmentButton uploadImage={mockUploadImage} />,
      );

      // Should render the default popover (not a custom render)
      expect(container.firstChild).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="custom-render"]'),
      ).toBeNull();
    });

    it('should handle click in custom render function', () => {
      const CustomRender = ({ children }: any) => (
        <div data-testid="custom-render">{children}</div>
      );

      const { getByTestId } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={CustomRender}
        />,
      );

      const attachmentButton = getByTestId('attachment-button');
      fireEvent.click(attachmentButton);

      expect(mockUploadImage).toHaveBeenCalled();
    });

    it('should not call uploadImage when disabled with custom render', () => {
      const CustomRender = ({ children }: any) => (
        <div data-testid="custom-render">{children}</div>
      );

      const { getByTestId } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={CustomRender}
          disabled={true}
        />,
      );

      const attachmentButton = getByTestId('attachment-button');
      fireEvent.click(attachmentButton);

      expect(mockUploadImage).not.toHaveBeenCalled();
    });

    it('should apply custom render with tooltip functionality', () => {
      const TooltipRender = ({ children, supportedFormat }: any) => (
        <div
          data-testid="tooltip-render"
          title={`Upload ${supportedFormat?.type} files`}
        >
          {children}
        </div>
      );

      const customFormat = {
        icon: <span>Image Icon</span>,
        type: 'Image',
        maxSize: 5120,
        extensions: ['jpg', 'png'],
      };

      const { getByTestId } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={TooltipRender}
          supportedFormat={customFormat}
        />,
      );

      const tooltipRender = getByTestId('tooltip-render');
      expect(tooltipRender).toHaveAttribute('title', 'Upload Image files');
    });

    it('should handle complex custom render with modal', () => {
      const ModalRender = ({ children, supportedFormat }: any) => {
        const [modalVisible, setModalVisible] = React.useState(false);

        return (
          <>
            <div
              data-testid="modal-trigger"
              onClick={() => setModalVisible(!modalVisible)}
            >
              {children}
            </div>
            {modalVisible && (
              <div data-testid="modal-content">
                Upload {supportedFormat?.type} files
              </div>
            )}
          </>
        );
      };

      const customFormat = {
        type: 'Document',
        maxSize: 10240,
        extensions: ['pdf', 'doc'],
        icon: <span>Doc Icon</span>,
      };

      const { getByTestId, queryByTestId } = render(
        <AttachmentButton
          uploadImage={mockUploadImage}
          render={ModalRender}
          supportedFormat={customFormat}
        />,
      );

      // Initially modal should not be visible
      expect(queryByTestId('modal-content')).toBeNull();

      // Click the trigger to show modal
      const modalTrigger = getByTestId('modal-trigger');
      fireEvent.click(modalTrigger);

      // Modal should now be visible
      expect(getByTestId('modal-content')).toBeInTheDocument();
      expect(getByTestId('modal-content')).toHaveTextContent(
        'Upload Document files',
      );
    });
  });
});
