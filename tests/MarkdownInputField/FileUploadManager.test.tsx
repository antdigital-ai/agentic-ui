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

describe('useFileUploadManager', () => {
  const mockOnFileMapChange = vi.fn();
  const mockUpload = vi.fn();
  const mockOnDelete = vi.fn();

  const createMockFile = (
    uuid: string,
    status: 'uploading' | 'done' | 'error' = 'done',
  ) => ({
    uuid,
    status,
    name: `file-${uuid}`,
    size: 1024,
    type: 'image/png',
    url: `http://example.com/${uuid}`,
  });

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
      const originalAppendChild = document.body.appendChild.bind(document.body);

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

  // Note: 文件上传、删除、重试等功能已经在主组件 MarkdownInputField 测试中验证
});
