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

  // Note: 文件上传、删除、重试等功能已经在主组件 MarkdownInputField 测试中验证
});
