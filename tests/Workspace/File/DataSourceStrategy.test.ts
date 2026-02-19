import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ContentDataSourceStrategy,
  DataSourceManager,
  DataSourceType,
  FileDataSourceStrategy,
  PreviewCapability,
  UrlDataSourceStrategy,
} from '../../../src/Workspace/File/DataSourceStrategy';

describe('DataSourceStrategy', () => {
  describe('UrlDataSourceStrategy', () => {
    const strategy = new UrlDataSourceStrategy();

    it('应该处理有URL的文件', () => {
      const file = {
        id: 'f1',
        name: 'image.png',
        url: 'https://example.com/image.png',
      };
      expect(strategy.canHandle(file)).toBe(true);
    });

    it('应该不处理没有URL的文件', () => {
      const file = { id: 'f1', name: 'file.txt' };
      expect(strategy.canHandle(file)).toBe(false);
    });

    it('应该处理图片URL', () => {
      const file = {
        id: 'f1',
        name: 'image.png',
        url: 'https://example.com/image.png',
      };
      const result = strategy.process(file);

      expect(result.sourceType).toBe(DataSourceType.URL);
      expect(result.previewUrl).toBe('https://example.com/image.png');
      expect(result.previewCapability).toBe(PreviewCapability.BASIC);
      expect(result.needsCleanup).toBe(false);
    });

    it('应该处理各种图片格式', () => {
      const imageExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'bmp',
        'webp',
        'svg',
      ];

      imageExtensions.forEach((ext) => {
        const file = {
          id: 'f1',
          name: `image.${ext}`,
          url: `https://example.com/image.${ext}`,
        };
        const result = strategy.process(file);
        expect(result.previewCapability).toBe(PreviewCapability.BASIC);
      });
    });

    it('应该处理非图片URL', () => {
      const file = {
        id: 'f1',
        name: 'doc.pdf',
        url: 'https://example.com/doc.pdf',
      };
      const result = strategy.process(file);

      expect(result.sourceType).toBe(DataSourceType.URL);
      expect(result.previewCapability).toBe(PreviewCapability.NONE);
    });

    it('应该推断MIME类型', () => {
      const testCases = [
        { ext: 'pdf', mime: 'application/pdf' },
        { ext: 'txt', mime: 'text/plain' },
        { ext: 'json', mime: 'application/json' },
      ];

      testCases.forEach(({ ext, mime }) => {
        const file = {
          id: 'f1',
          name: `file.${ext}`,
          url: `https://example.com/file.${ext}`,
        };
        const result = strategy.process(file);
        expect(result.mimeType).toBe(mime);
      });
    });

    it('应该推断图片MIME类型', () => {
      const file = {
        id: 'f1',
        name: 'image.png',
        url: 'https://example.com/image.png',
      };
      const result = strategy.process(file);
      // image扩展名都映射到同一个类型，因此检查是否包含image/
      expect(result.mimeType).toContain('image/');
    });

    it('应该处理未知扩展名', () => {
      const file = {
        id: 'f1',
        name: 'file.unknown',
        url: 'https://example.com/file.unknown',
      };
      const result = strategy.process(file);
      expect(result.mimeType).toBe('application/octet-stream');
    });

    it('应该处理没有扩展名的URL', () => {
      const file = { id: 'f1', name: 'file', url: 'https://example.com/file' };
      const result = strategy.process(file);
      expect(result.mimeType).toBe('application/octet-stream');
    });

    it('应该处理 URL 路径末尾无扩展名时返回 Other 与默认 MIME', () => {
      const file = {
        id: 'f1',
        name: 'file',
        url: 'https://example.com/',
      };
      const result = strategy.process(file);
      expect(result.previewCapability).toBe(PreviewCapability.NONE);
      expect(result.mimeType).toBe('application/octet-stream');
    });

    it('url 无扩展名时 getFileCategory 返回 Other', () => {
      const file = { id: 'f1', name: 'x', url: 'http://a.' };
      const result = strategy.process(file);
      expect(result.previewCapability).toBe(PreviewCapability.NONE);
      expect(result.mimeType).toBe('application/octet-stream');
    });

    it('扩展名不在 FILE_TYPES 时 inferMimeType 返回默认', () => {
      const file = {
        id: 'f1',
        name: 'file.xyz',
        url: 'https://example.com/file.xyz',
      };
      const result = strategy.process(file);
      expect(result.mimeType).toBe('application/octet-stream');
    });

    it('应该在URL不存在时抛出错误', () => {
      const file = { id: 'f1', name: 'file.txt' };
      expect(() => strategy.process(file)).toThrow('URL not provided');
    });
  });

  describe('ContentDataSourceStrategy', () => {
    const strategy = new ContentDataSourceStrategy();
    let originalURL: typeof URL | undefined;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // 保存原始 URL 对象
      originalURL = (globalThis as any).URL;

      // 创建 mock 函数
      mockCreateObjectURL = vi.fn((blob: Blob) => 'blob:mock-url');
      mockRevokeObjectURL = vi.fn();

      // 设置 mock URL
      (globalThis as any).URL = {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      };
    });

    afterEach(() => {
      // 恢复原始 URL
      if (originalURL) {
        (globalThis as any).URL = originalURL;
      }
      vi.clearAllMocks();
    });

    it('应该处理有content的文件', () => {
      const file = { id: 'f1', name: 'file.txt', content: 'Hello World' };
      expect(strategy.canHandle(file)).toBe(true);
    });

    it('应该不处理没有content的文件', () => {
      const file = { id: 'f1', name: 'file.txt' };
      expect(strategy.canHandle(file)).toBe(false);
    });

    it('应该处理文本内容', () => {
      const file = { id: 'f1', name: 'file.txt', content: 'Test content' };
      const result = strategy.process(file);

      expect(result.sourceType).toBe(DataSourceType.CONTENT);
      expect(result.previewCapability).toBe(PreviewCapability.FULL);
      expect(result.content).toBe('Test content');
      expect(result.mimeType).toBe('text/plain');
      expect(result.previewUrl).toBe('blob:mock-url');
      expect(result.needsCleanup).toBe(true);
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('应该处理空内容', () => {
      const file = { id: 'f1', name: 'file.txt', content: '' };
      // 空字符串被视为 falsy，会抛出错误
      expect(() => strategy.process(file)).toThrow('Content not provided');
    });

    it('应该处理多行内容', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const file = { id: 'f1', name: 'file.txt', content };
      const result = strategy.process(file);

      expect(result.content).toBe(content);
    });

    it('应该在content不存在时抛出错误', () => {
      const file = { id: 'f1', name: 'file.txt' };
      expect(() => strategy.process(file)).toThrow('Content not provided');
    });
  });

  describe('FileDataSourceStrategy', () => {
    const strategy = new FileDataSourceStrategy();
    let originalURL: typeof URL | undefined;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      originalURL = (globalThis as any).URL;
      mockCreateObjectURL = vi.fn((file: File) => `blob:${file.name}`);
      mockRevokeObjectURL = vi.fn();

      (globalThis as any).URL = {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      };
    });

    afterEach(() => {
      if (originalURL) {
        (globalThis as any).URL = originalURL;
      }
      vi.clearAllMocks();
    });

    it('应该处理有file对象的文件', () => {
      const fileObj = new File(['content'], 'test.txt', { type: 'text/plain' });
      const file = { id: 'f1', name: 'test.txt', file: fileObj };
      expect(strategy.canHandle(file)).toBe(true);
    });

    it('应该不处理没有file对象的文件', () => {
      const file = { id: 'f1', name: 'test.txt' };
      expect(strategy.canHandle(file)).toBe(false);
    });

    it('应该处理图片文件', () => {
      const fileObj = new File(['image'], 'photo.png', { type: 'image/png' });
      const file = { id: 'f1', name: 'photo.png', file: fileObj };
      const result = strategy.process(file);

      expect(result.sourceType).toBe(DataSourceType.FILE);
      expect(result.previewCapability).toBe(PreviewCapability.FULL);
      expect(result.previewUrl).toBe('blob:photo.png');
      expect(result.mimeType).toBe('image/png');
      expect(result.needsCleanup).toBe(true);
    });

    it('应该处理视频文件', () => {
      const fileObj = new File(['video'], 'movie.mp4', { type: 'video/mp4' });
      const file = { id: 'f1', name: 'movie.mp4', file: fileObj };
      const result = strategy.process(file);

      expect(result.previewCapability).toBe(PreviewCapability.FULL);
      expect(result.mimeType).toBe('video/mp4');
    });

    it('应该处理文本文件', () => {
      const fileObj = new File(['text'], 'doc.txt', { type: 'text/plain' });
      const file = { id: 'f1', name: 'doc.txt', file: fileObj };
      const result = strategy.process(file);

      expect(result.previewCapability).toBe(PreviewCapability.FULL);
      expect(result.mimeType).toBe('text/plain');
    });

    it('应该处理PDF文件', () => {
      const fileObj = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
      const file = { id: 'f1', name: 'doc.pdf', file: fileObj };
      const result = strategy.process(file);

      expect(result.previewCapability).toBe(PreviewCapability.FULL);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('应该处理代码文件', () => {
      const codeMimeTypes = [
        'text/javascript',
        'application/javascript',
        'text/typescript',
        'text/x-python',
        'application/json',
      ];

      codeMimeTypes.forEach((mimeType) => {
        const fileObj = new File(['code'], 'file', { type: mimeType });
        const file = { id: 'f1', name: 'file', file: fileObj };
        const result = strategy.process(file);

        expect(result.previewCapability).toBe(PreviewCapability.FULL);
      });
    });

    it('应该处理其他类型文件', () => {
      const fileObj = new File(['data'], 'file.bin', {
        type: 'application/octet-stream',
      });
      const file = { id: 'f1', name: 'file.bin', file: fileObj };
      const result = strategy.process(file);

      expect(result.previewCapability).toBe(PreviewCapability.NONE);
    });

    it('应该在file对象不存在时抛出错误', () => {
      const file = { id: 'f1', name: 'test.txt' };
      expect(() => strategy.process(file)).toThrow('File object not provided');
    });

    it('应该处理Blob对象', () => {
      const blob = new Blob(['content'], { type: 'text/plain' });
      const file = { id: 'f1', name: 'test.txt', file: blob };
      const result = strategy.process(file);

      expect(result.sourceType).toBe(DataSourceType.FILE);
      expect(result.mimeType).toBe('text/plain');
    });
  });

  describe('DataSourceManager', () => {
    let manager: DataSourceManager;
    let originalURL: typeof URL | undefined;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      manager = new DataSourceManager();
      originalURL = (globalThis as any).URL;
      mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      mockRevokeObjectURL = vi.fn();

      (globalThis as any).URL = {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      };
    });

    afterEach(() => {
      if (originalURL) {
        (globalThis as any).URL = originalURL;
      }
      vi.clearAllMocks();
    });

    it('应该按优先级处理文件（content优先）', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
        content: 'content',
        file: new File(['file'], 'test.txt'),
        url: 'https://example.com/test.txt',
      };
      const result = manager.processFile(file);

      expect(result.sourceType).toBe(DataSourceType.CONTENT);
    });

    it('应该按优先级处理文件（file次之）', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
        file: new File(['file'], 'test.txt'),
        url: 'https://example.com/test.txt',
      };
      const result = manager.processFile(file);

      expect(result.sourceType).toBe(DataSourceType.FILE);
    });

    it('应该按优先级处理文件（url最后）', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
        url: 'https://example.com/test.txt',
      };
      const result = manager.processFile(file);

      expect(result.sourceType).toBe(DataSourceType.URL);
    });

    it('应该为没有数据源的文件返回默认结果', () => {
      const file = { id: 'f1', name: 'test.txt' };
      const result = manager.processFile(file);

      expect(result.sourceType).toBe(DataSourceType.URL);
      expect(result.previewCapability).toBe(PreviewCapability.NONE);
      expect(result.needsCleanup).toBe(false);
    });

    it('应该清理Blob URL', () => {
      const result = {
        sourceType: DataSourceType.CONTENT,
        previewCapability: PreviewCapability.FULL,
        previewUrl: 'blob:mock-url',
        needsCleanup: true,
      };

      manager.cleanupResult(result);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('应该不清理非Blob URL', () => {
      const result = {
        sourceType: DataSourceType.URL,
        previewCapability: PreviewCapability.BASIC,
        previewUrl: 'https://example.com/image.png',
        needsCleanup: false,
      };

      manager.cleanupResult(result);
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });

    it('应该不清理没有needsCleanup标志的结果', () => {
      const result = {
        sourceType: DataSourceType.FILE,
        previewCapability: PreviewCapability.FULL,
        previewUrl: 'blob:mock-url',
        needsCleanup: false,
      };

      manager.cleanupResult(result);
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });

    it('应该不清理没有previewUrl的结果', () => {
      const result = {
        sourceType: DataSourceType.CONTENT,
        previewCapability: PreviewCapability.FULL,
        needsCleanup: true,
      };

      manager.cleanupResult(result);
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });

    it('应该支持注册自定义策略', () => {
      const customStrategy = {
        canHandle: (file: any) => file.custom === true,
        process: (file: any) => ({
          sourceType: DataSourceType.URL,
          previewCapability: PreviewCapability.FULL,
          previewUrl: 'custom://url',
          needsCleanup: false,
        }),
      };

      manager.registerStrategy(customStrategy);

      const file = { id: 'f1', name: 'custom.txt', custom: true };
      const result = manager.processFile(file);

      expect(result.previewUrl).toBe('custom://url');
    });

    it('应该让新策略具有更高优先级', () => {
      const highPriorityStrategy = {
        canHandle: () => true,
        process: () => ({
          sourceType: DataSourceType.URL,
          previewCapability: PreviewCapability.FULL,
          previewUrl: 'high-priority://url',
          needsCleanup: false,
        }),
      };

      manager.registerStrategy(highPriorityStrategy);

      const file = {
        id: 'f1',
        name: 'test.txt',
        content: 'content',
        file: new File(['file'], 'test.txt'),
        url: 'https://example.com/test.txt',
      };
      const result = manager.processFile(file);

      expect(result.previewUrl).toBe('high-priority://url');
    });
  });

  describe('全局实例', () => {
    it('应该导出全局dataSourceManager实例', async () => {
      const { dataSourceManager } = await import(
        '../../../src/Workspace/File/DataSourceStrategy'
      );
      expect(dataSourceManager).toBeInstanceOf(DataSourceManager);
    });
  });
});
