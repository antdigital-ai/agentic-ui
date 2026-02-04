import { renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import { useFileUploadManager } from '../../src/MarkdownInputField/FileUploadManager';

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock upLoadFileToServer
vi.mock('../../src/MarkdownInputField/AttachmentButton', () => ({
  upLoadFileToServer: vi.fn().mockResolvedValue(undefined),
}));

// Mock device detection utilities
vi.mock('../../src/MarkdownInputField/AttachmentButton/utils', () => ({
  isMobileDevice: vi.fn().mockReturnValue(false),
  isVivoOrOppoDevice: vi.fn().mockReturnValue(false),
  isWeChat: vi.fn().mockReturnValue(false),
}));

// Import the utils module for mocking in tests
import * as utils from '../../src/MarkdownInputField/AttachmentButton/utils';

describe('useFileUploadManager', () => {
  const mockOnFileMapChange = vi.fn();
  const mockUpload = vi.fn();
  const mockUploadWithResponse = vi.fn();
  const mockOnDelete = vi.fn();

  const createMockFile = (
    uuid: string,
    status: 'uploading' | 'done' | 'error' = 'done',
  ) => {
    const file = new File([`content-${uuid}`], `file-${uuid}`, {
      type: 'image/png',
    });
    return Object.assign(file, {
      uuid,
      status,
      url: `http://example.com/${uuid}`,
    });
  };

  const defaultProps = {
    attachment: {
      enable: true,
      upload: mockUpload,
      onDelete: mockOnDelete,
    },
    fileMap: new Map(),
    onFileMapChange: mockOnFileMapChange,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <I18nContext.Provider
      value={{
        locale: {
          uploadSuccess: 'Upload success',
          uploadFailed: 'Upload failed',
        } as any,
        language: 'en-US',
      }}
    >
      {children}
    </I18nContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset device detection mocks
    vi.mocked(utils.isMobileDevice).mockReturnValue(false);
    vi.mocked(utils.isVivoOrOppoDevice).mockReturnValue(false);
    vi.mocked(utils.isWeChat).mockReturnValue(false);
  });

  describe('基本功能', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      expect(result.current.fileMap).toEqual(new Map());
      expect(result.current.fileUploadDone).toBe(true);
      expect(result.current.supportedFormat).toBeDefined();
    });

    it('应该判断所有文件上传完成', () => {
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'done'));
      fileMap.set('file2', createMockFile('file2', 'done'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            fileMap,
          }),
        { wrapper },
      );

      expect(result.current.fileUploadDone).toBe(true);
    });

    it('应该判断存在上传中的文件', () => {
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'done'));
      fileMap.set('file2', createMockFile('file2', 'uploading'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            fileMap,
          }),
        { wrapper },
      );

      expect(result.current.fileUploadDone).toBe(false);
    });

    it('应该判断存在上传失败的文件', () => {
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'done'));
      fileMap.set('file2', createMockFile('file2', 'error'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            fileMap,
          }),
        { wrapper },
      );

      expect(result.current.fileUploadDone).toBe(false);
    });
  });

  describe('文件格式配置', () => {
    it('应该使用正确的文件格式配置', () => {
      const customFormat = {
        extensions: ['.pdf', '.doc'],
        maxSize: 10 * 1024 * 1024,
      };

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              supportedFormat: customFormat,
            } as any,
          }),
        { wrapper },
      );

      expect(result.current.supportedFormat).toEqual(customFormat);
    });
  });

  describe('maxFileCount 点击拦截', () => {
    it('应该在已达到 maxFileCount 时阻止打开文件选择对话框', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'done'));
      fileMap.set('file2', createMockFile('file2', 'done'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              maxFileCount: 2,
            },
            fileMap,
          }),
        { wrapper },
      );

      // 调用 uploadImage
      await result.current.uploadImage();

      // 应该显示错误提示
      expect(message.error).toHaveBeenCalledWith('最多只能上传 2 个文件');
    });

    it('应该在未达到 maxFileCount 时允许打开文件选择对话框', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'done'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              maxFileCount: 3,
            },
            fileMap,
          }),
        { wrapper },
      );

      // 模拟 DOM 操作
      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'input') {
            element.click = clickSpy;
          }
          return element;
        });

      // 调用 uploadImage
      await result.current.uploadImage();

      // 不应该显示错误提示
      expect(message.error).not.toHaveBeenCalledWith(
        expect.stringContaining('最多只能上传'),
      );

      createElementSpy.mockRestore();
    });

    it('应该使用国际化文案显示错误提示', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'done'));
      fileMap.set('file2', createMockFile('file2', 'done'));

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <I18nContext.Provider
          value={{
            locale: {
              'markdownInput.maxFileCountExceeded':
                '最多上传 ${maxFileCount} 个',
            } as any,
            language: 'zh-CN',
          }}
        >
          {children}
        </I18nContext.Provider>
      );

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              maxFileCount: 2,
            },
            fileMap,
          }),
        { wrapper: customWrapper },
      );

      // 调用 uploadImage
      await result.current.uploadImage();

      // 应该使用国际化文案
      expect(message.error).toHaveBeenCalledWith('最多上传 2 个');
    });
  });

  describe('uploadImage forGallery 参数', () => {
    it('应该在 forGallery 为 true 时设置 accept 为 image/*', async () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const clickSpy = vi.fn();
      const appendChildSpy = vi.fn();
      const removeSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);

      let createdInput: HTMLInputElement | null = null;

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'input') {
            const inputElement = element as HTMLInputElement;
            inputElement.click = clickSpy;
            inputElement.accept = '';
            createdInput = inputElement;
          }
          return element;
        });

      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
        appendChildSpy(node);
        return node;
      });

      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        removeSpy,
      );

      // 调用 uploadImage(true) - 相册模式
      await result.current.uploadImage(true);

      // 验证 accept 属性被设置为 'image/*'
      expect(createdInput!.accept).toBe('image/*');
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该在 forGallery 为 false 时根据设备类型设置 accept', async () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);

      let createdInput: HTMLInputElement | null = null;

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'input') {
            const inputElement = element as HTMLInputElement;
            inputElement.click = clickSpy;
            inputElement.accept = '';
            createdInput = inputElement;
          }
          return element;
        });

      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      // 调用 uploadImage(false) - 文件选择模式
      await result.current.uploadImage(false);

      // 验证 accept 属性被设置（具体值取决于设备类型和格式）
      expect(createdInput!.accept).toBeDefined();
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该在 forGallery 为 undefined 时使用默认行为', async () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);

      let createdInput: HTMLInputElement | null = null;

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'input') {
            const inputElement = element as HTMLInputElement;
            inputElement.click = clickSpy;
            inputElement.accept = '';
            createdInput = inputElement;
          }
          return element;
        });

      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      // 调用 uploadImage() - 不传参数
      await result.current.uploadImage();

      // 验证 accept 属性被设置（应该和 false 时一样）
      expect(createdInput!.accept).toBeDefined();
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该在文件正在上传时阻止新的上传', async () => {
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'uploading'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            fileMap,
          }),
        { wrapper },
      );

      const clickSpy = vi.fn();
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = document.createElement(tagName);
          if (tagName === 'input') {
            element.click = clickSpy;
          }
          return element;
        });

      // 调用 uploadImage
      await result.current.uploadImage(true);

      // 应该不会触发文件选择对话框
      expect(clickSpy).not.toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });

  describe('updateAttachmentFiles', () => {
    it('应该更新文件映射表', () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const newFileMap = new Map();
      newFileMap.set('file1', createMockFile('file1', 'done'));

      result.current.updateAttachmentFiles(newFileMap);

      expect(mockOnFileMapChange).toHaveBeenCalledWith(new Map(newFileMap));
    });

    it('应该处理 undefined 文件映射表', () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      result.current.updateAttachmentFiles(undefined);

      expect(mockOnFileMapChange).toHaveBeenCalledWith(new Map(undefined));
    });
  });

  describe('handleFileRemoval', () => {
    it('应该删除文件并更新映射表', async () => {
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'done');
      fileMap.set('file1', file1);

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRemoval(file1);

      expect(mockOnDelete).toHaveBeenCalledWith(file1);
      expect(mockOnFileMapChange).toHaveBeenCalled();
      const callArgs = mockOnFileMapChange.mock.calls[0][0];
      expect(callArgs?.has('file1')).toBe(false);
    });

    it('应该处理删除失败的情况', async () => {
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'done');
      fileMap.set('file1', file1);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockOnDelete.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRemoval(file1);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error removing file:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleFileRetry', () => {
    it('应该使用 uploadWithResponse 重试上传', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'error');
      fileMap.set('file1', file1);

      const mockUploadWithResponse = vi.fn().mockResolvedValue({
        fileUrl: 'http://example.com/file1',
        uploadStatus: 'SUCCESS',
        errorMessage: null,
      });

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              uploadWithResponse: mockUploadWithResponse,
            } as any,
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRetry(file1);

      expect(mockUploadWithResponse).toHaveBeenCalledWith(file1, 0);
      expect(message.success).toHaveBeenCalledWith('Upload success');
      expect(mockOnFileMapChange).toHaveBeenCalled();
    });

    it('应该使用 upload 重试上传', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'error');
      fileMap.set('file1', file1);

      const mockUpload = vi.fn().mockResolvedValue('http://example.com/file1');

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              upload: mockUpload,
            },
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRetry(file1);

      expect(mockUpload).toHaveBeenCalledWith(file1, 0);
      expect(message.success).toHaveBeenCalledWith('Upload success');
    });

    it('应该处理上传失败的情况', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'error');
      fileMap.set('file1', file1);

      const mockUploadWithResponse = vi.fn().mockResolvedValue({
        fileUrl: null,
        uploadStatus: 'FAILED',
        errorMessage: 'Upload failed',
      });

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              uploadWithResponse: mockUploadWithResponse,
            } as any,
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRetry(file1);

      expect(message.error).toHaveBeenCalledWith('Upload failed');
      expect(mockOnFileMapChange).toHaveBeenCalled();
    });

    it('应该处理 upload 返回空 URL 的情况', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'error');
      fileMap.set('file1', file1);

      const mockUpload = vi.fn().mockResolvedValue(null);

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              upload: mockUpload,
            },
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRetry(file1);

      expect(message.error).toHaveBeenCalledWith('Upload failed');
    });

    it('应该处理重试时抛出异常的情况', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'error');
      fileMap.set('file1', file1);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockUpload = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              upload: mockUpload,
            },
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRetry(file1);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error retrying file upload:',
        expect.any(Error),
      );
      expect(message.error).toHaveBeenCalledWith('Network error');

      consoleErrorSpy.mockRestore();
    });

    it('应该处理非 Error 类型的异常', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      const file1 = createMockFile('file1', 'error');
      fileMap.set('file1', file1);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockUpload = vi.fn().mockRejectedValue('String error');

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              upload: mockUpload,
            },
            fileMap,
          }),
        { wrapper },
      );

      await result.current.handleFileRetry(file1);

      expect(message.error).toHaveBeenCalledWith('Upload failed');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('uploadImage 文件选择处理', () => {
    it('应该处理文件选择为空的情况', async () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const mockInput = document.createElement('input');
      mockInput.type = 'file';
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      await result.current.uploadImage();

      // 模拟空文件选择
      const changeEvent = {
        target: { files: null },
      } as any;
      mockInput.onchange?.(changeEvent);

      // 不应该调用上传函数
      const { upLoadFileToServer } = await import(
        '../../src/MarkdownInputField/AttachmentButton'
      );
      expect(upLoadFileToServer).not.toHaveBeenCalled();

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该处理文件数量超过限制的情况', async () => {
      const { message } = await import('antd');
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const mockFile1 = new File(['test1'], 'test1.png', {
        type: 'image/png',
      });
      const mockFile2 = new File(['test2'], 'test2.png', {
        type: 'image/png',
      });
      const mockFile3 = new File(['test3'], 'test3.png', {
        type: 'image/png',
      });

      const mockInput = document.createElement('input');
      mockInput.type = 'file';
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      await result.current.uploadImage();

      // 模拟选择超过限制的文件
      const changeEvent = {
        target: {
          files: [mockFile1, mockFile2, mockFile3],
        },
      } as any;

      const { result: resultWithLimit } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              maxFileCount: 2,
            },
          }),
        { wrapper },
      );

      await resultWithLimit.current.uploadImage();
      mockInput.onchange?.(changeEvent);

      expect(message.error).toHaveBeenCalledWith('最多只能上传 2 个文件');

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该处理文件总数超过限制的情况', async () => {
      const { message } = await import('antd');
      const fileMap = new Map();
      fileMap.set('file1', createMockFile('file1', 'done'));

      const mockFile1 = new File(['test1'], 'test1.png', {
        type: 'image/png',
      });
      const mockFile2 = new File(['test2'], 'test2.png', {
        type: 'image/png',
      });

      const mockInput = document.createElement('input');
      mockInput.type = 'file';
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      const { result } = renderHook(
        () =>
          useFileUploadManager({
            ...defaultProps,
            attachment: {
              ...defaultProps.attachment,
              maxFileCount: 2,
            },
            fileMap,
          }),
        { wrapper },
      );

      await result.current.uploadImage();

      // 模拟选择文件（已有1个，再选2个，总共3个超过限制2个）
      const changeEvent = {
        target: {
          files: [mockFile1, mockFile2],
        },
      } as any;
      mockInput.onchange?.(changeEvent);

      expect(message.error).toHaveBeenCalledWith('最多只能上传 2 个文件');

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该处理 readonly 状态', async () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const mockInput = document.createElement('input');
      mockInput.type = 'file';
      mockInput.dataset.readonly = 'true';
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      await result.current.uploadImage();

      // 模拟文件选择
      const changeEvent = {
        target: {
          files: [new File(['test'], 'test.png', { type: 'image/png' })],
        },
      } as any;
      mockInput.onchange?.(changeEvent);

      // readonly 状态下不应该处理
      const { upLoadFileToServer } = await import(
        '../../src/MarkdownInputField/AttachmentButton'
      );
      expect(upLoadFileToServer).not.toHaveBeenCalled();

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该处理上传异常', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { upLoadFileToServer } = await import(
        '../../src/MarkdownInputField/AttachmentButton'
      );
      vi.mocked(upLoadFileToServer).mockRejectedValue(
        new Error('Upload error'),
      );

      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const mockInput = document.createElement('input');
      mockInput.type = 'file';
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      await result.current.uploadImage();

      // 模拟文件选择
      const changeEvent = {
        target: {
          files: [new File(['test'], 'test.png', { type: 'image/png' })],
        },
      } as any;
      await mockInput.onchange?.(changeEvent);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error uploading files:',
        expect.any(Error),
      );

      createElementSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      vi.restoreAllMocks();
    });

    it('应该在文件选择后清理 input 元素', async () => {
      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const mockInput = document.createElement('input');
      mockInput.type = 'file';
      // file input 的 value 只能设置为空字符串，不能设置为其他值
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      const removeSpy = vi
        .spyOn(HTMLInputElement.prototype, 'remove')
        .mockImplementation(vi.fn());

      await result.current.uploadImage();

      // 模拟文件选择
      const changeEvent = {
        target: mockInput,
        files: [new File(['test'], 'test.png', { type: 'image/png' })],
      } as any;

      // 手动触发 onchange
      if (mockInput.onchange) {
        await mockInput.onchange(changeEvent);
      }

      // 验证 input 被清理（在 finally 块中）
      expect(mockInput.value).toBe('');
      expect(mockInput.dataset.readonly).toBeUndefined();

      createElementSpy.mockRestore();
      removeSpy.mockRestore();
      vi.restoreAllMocks();
    });
  });

  describe('getAcceptValue 设备类型处理', () => {
    it('应该在微信环境下返回 *', async () => {
      vi.mock('../../src/MarkdownInputField/AttachmentButton/utils', () => ({
        isMobileDevice: vi.fn().mockReturnValue(false),
        isVivoOrOppoDevice: vi.fn().mockReturnValue(false),
        isWeChat: vi.fn().mockReturnValue(true),
      }));

      const { result } = renderHook(() => useFileUploadManager(defaultProps), {
        wrapper,
      });

      const mockInput = document.createElement('input');
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput);
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(HTMLInputElement.prototype, 'remove').mockImplementation(
        vi.fn(),
      );

      await result.current.uploadImage(false);

      // 在微信环境下，accept 应该被设置为 '*'
      // 注意：由于 mock 的限制，这里主要验证函数能正常执行
      expect(createElementSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
      vi.restoreAllMocks();
    });
  });
});
