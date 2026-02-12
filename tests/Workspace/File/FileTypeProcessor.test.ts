import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DataSourceManager,
  DataSourceType,
} from '../../../src/Workspace/File/DataSourceStrategy';
import {
  FileTypeProcessor,
  fileTypeProcessor,
  getMimeType,
  isArchiveFile,
  isAudioFile,
  isImageFile,
  isPdfFile,
  isTextFile,
  isVideoFile,
} from '../../../src/Workspace/File/FileTypeProcessor';
import { FileCategory } from '../../../src/Workspace/types';

describe('FileTypeProcessor', () => {
  let processor: FileTypeProcessor;
  let dataSourceManager: DataSourceManager;
  let originalURL: typeof URL | undefined;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dataSourceManager = new DataSourceManager();
    processor = new FileTypeProcessor(dataSourceManager);

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

  describe('inferFileType', () => {
    it('应该使用明确指定的类型', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
        type: 'pdf' as const,
      };
      const result = processor.inferFileType(file);

      expect(result.fileType).toBe('pdf');
      expect(result.category).toBe(FileCategory.PDF);
    });

    it('应该从File对象的MIME类型推断', () => {
      const fileObj = new File(['content'], 'test.txt', { type: 'text/plain' });
      const file = {
        id: 'f1',
        name: 'test.txt',
        file: fileObj,
      };
      const result = processor.inferFileType(file);

      expect(result.fileType).toBe('plainText');
      expect(result.category).toBe(FileCategory.Text);
    });

    it('应该从文件名扩展名推断', () => {
      const file = {
        id: 'f1',
        name: 'document.pdf',
      };
      const result = processor.inferFileType(file);

      expect(result.fileType).toBe('pdf');
      expect(result.category).toBe(FileCategory.PDF);
    });

    it('应该从URL扩展名推断', () => {
      const file = {
        id: 'f1',
        name: 'file',
        url: 'https://example.com/image.png',
      };
      const result = processor.inferFileType(file);

      expect(result.fileType).toBe('image');
      expect(result.category).toBe(FileCategory.Image);
    });

    it('应该处理带查询参数的URL', () => {
      const file = {
        id: 'f1',
        name: 'file',
        url: 'https://example.com/image.png?size=large',
      };
      const result = processor.inferFileType(file);

      expect(result.fileType).toBe('image');
    });

    it('应该使用displayType', () => {
      const file = {
        id: 'f1',
        name: 'test.pdf',
        displayType: '重要文档',
      };
      const result = processor.inferFileType(file);

      expect(result.displayType).toBe('重要文档');
    });

    it('应该返回默认类型', () => {
      const file = {
        id: 'f1',
        name: 'unknown',
      };
      const result = processor.inferFileType(file);

      expect(result.fileType).toBe('plainText');
      expect(result.category).toBe(FileCategory.Text);
    });

    it('文件名无有效扩展名时 getTypeFromFileName 返回 null', () => {
      const file = { id: 'f1', name: '.' };
      const result = processor.inferFileType(file);
      expect(result.fileType).toBe('plainText');
      expect(result.category).toBe(FileCategory.Text);
    });

    it('URL 无有效扩展名时 getTypeFromUrl 返回 null', () => {
      const file = { id: 'f1', name: 'x', url: '' };
      const result = processor.inferFileType(file);
      expect(result.fileType).toBe('plainText');
      expect(result.category).toBe(FileCategory.Text);
    });

    it('应该处理各种图片类型', () => {
      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

      extensions.forEach((ext) => {
        const file = { id: `f-${ext}`, name: `image.${ext}` };
        const result = processor.inferFileType(file);
        expect(result.category).toBe(FileCategory.Image);
      });
    });

    it('应该处理各种视频类型', () => {
      const extensions = ['mp4', 'webm', 'ogg'];

      extensions.forEach((ext) => {
        const file = { id: `f-${ext}`, name: `video.${ext}` };
        const result = processor.inferFileType(file);
        expect(result.category).toBe(FileCategory.Video);
      });
    });

    it('应该处理各种音频类型', () => {
      const extensions = ['mp3', 'wav', 'aac', 'm4a'];

      extensions.forEach((ext) => {
        const file = { id: `f-${ext}`, name: `audio.${ext}` };
        const result = processor.inferFileType(file);
        expect(result.category).toBe(FileCategory.Audio);
      });
    });

    it('应该处理代码文件', () => {
      const files = [
        { name: 'script.js', type: 'javascript' },
        { name: 'app.ts', type: 'typescript' },
        { name: 'main.py', type: 'python' },
        { name: 'Main.java', type: 'java' },
      ];

      files.forEach(({ name, type }) => {
        const file = { id: name, name };
        const result = processor.inferFileType(file);
        expect(result.fileType).toBe(type);
        expect(result.category).toBe(FileCategory.Code);
      });
    });
  });

  describe('processFile', () => {
    it('应该完整处理有内容的文件', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
        content: 'Hello World',
      };
      const result = processor.processFile(file);

      expect(result.typeInference.fileType).toBe('plainText');
      expect(result.dataSource.sourceType).toBe(DataSourceType.CONTENT);
      expect(result.canPreview).toBe(true);
      expect(result.previewMode).toBe('inline');
    });

    it('应该完整处理图片文件', () => {
      const file = {
        id: 'f1',
        name: 'photo.png',
        url: 'https://example.com/photo.png',
      };
      const result = processor.processFile(file);

      expect(result.typeInference.category).toBe(FileCategory.Image);
      expect(result.canPreview).toBe(true);
      expect(result.previewMode).toBe('modal');
    });

    it('应该完整处理视频文件', () => {
      const fileObj = new File(['video'], 'movie.mp4', { type: 'video/mp4' });
      const file = {
        id: 'f1',
        name: 'movie.mp4',
        file: fileObj,
      };
      const result = processor.processFile(file);

      expect(result.typeInference.category).toBe(FileCategory.Video);
      expect(result.canPreview).toBe(true);
      expect(result.previewMode).toBe('inline');
    });

    it('应该完整处理音频文件', () => {
      const fileObj = new File(['audio'], 'song.mp3', { type: 'audio/mpeg' });
      const file = {
        id: 'f1',
        name: 'song.mp3',
        file: fileObj,
      };
      const result = processor.processFile(file);

      expect(result.typeInference.category).toBe(FileCategory.Audio);
      // Audio文件暂不支持预览
      expect(result.canPreview).toBe(false);
      expect(result.previewMode).toBe('none');
    });

    it('应该完整处理PDF文件', () => {
      const fileObj = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
      const file = {
        id: 'f1',
        name: 'doc.pdf',
        file: fileObj,
      };
      const result = processor.processFile(file);

      expect(result.typeInference.category).toBe(FileCategory.PDF);
      expect(result.canPreview).toBe(true);
      expect(result.previewMode).toBe('inline');
    });

    it('应该完整处理压缩文件', () => {
      const fileObj = new File(['data'], 'archive.zip', {
        type: 'application/zip',
      });
      const file = {
        id: 'f1',
        name: 'archive.zip',
        file: fileObj,
      };
      const result = processor.processFile(file);

      expect(result.typeInference.category).toBe(FileCategory.Archive);
      // 压缩文件不支持预览
      expect(result.canPreview).toBe(false);
      expect(result.previewMode).toBe('none');
    });

    it('应该处理不支持预览的文件', () => {
      const file = {
        id: 'f1',
        name: 'data.bin',
        url: 'https://example.com/data.bin',
      };
      const result = processor.processFile(file);

      expect(result.canPreview).toBe(false);
      expect(result.previewMode).toBe('none');
    });

    it('应该处理代码文件', () => {
      const fileObj = new File(['const x = 1;'], 'app.js', {
        type: 'text/javascript',
      });
      const file = {
        id: 'f1',
        name: 'app.js',
        file: fileObj,
      };
      const result = processor.processFile(file);

      expect(result.typeInference.category).toBe(FileCategory.Code);
      expect(result.previewMode).toBe('inline');
    });
  });

  describe('cleanupResult', () => {
    it('应该清理处理结果', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
        content: 'content',
      };
      const result = processor.processFile(file);

      processor.cleanupResult(result);
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('应该处理不需要清理的结果', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
        url: 'https://example.com/test.txt',
      };
      const result = processor.processFile(file);

      processor.cleanupResult(result);
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('determinePreviewCapability', () => {
    it('应该支持文本文件预览', () => {
      const file = {
        id: 'f1',
        name: 'doc.txt',
        content: 'text',
      };
      const result = processor.processFile(file);
      expect(result.canPreview).toBe(true);
    });

    it('应该支持代码文件预览', () => {
      const file = {
        id: 'f1',
        name: 'app.js',
        content: 'code',
      };
      const result = processor.processFile(file);
      expect(result.canPreview).toBe(true);
    });

    it('应该支持图片预览', () => {
      const file = {
        id: 'f1',
        name: 'image.png',
        url: 'https://example.com/image.png',
      };
      const result = processor.processFile(file);
      expect(result.canPreview).toBe(true);
    });

    it('应该处理无预览能力的数据源', () => {
      const file = {
        id: 'f1',
        name: 'test.txt',
      };
      const result = processor.processFile(file);
      expect(result.canPreview).toBe(false);
    });
  });

  describe('determinePreviewMode', () => {
    it('应该为文本和代码返回inline模式', () => {
      const files = [
        { name: 'doc.txt', content: 'text' },
        { name: 'app.js', content: 'code' },
      ];

      files.forEach((file) => {
        const result = processor.processFile(file);
        expect(result.previewMode).toBe('inline');
      });
    });

    it('应该为图片返回modal模式', () => {
      const file = {
        id: 'f1',
        name: 'image.png',
        url: 'https://example.com/image.png',
      };
      const result = processor.processFile(file);
      expect(result.previewMode).toBe('modal');
    });

    it('应该为不支持的文件返回none', () => {
      const file = {
        id: 'f1',
        name: 'unknown.xyz',
      };
      const result = processor.processFile(file);
      expect(result.previewMode).toBe('none');
    });

    it('应该为压缩文件返回none（不支持预览）', () => {
      const file = {
        id: 'f1',
        name: 'archive.zip',
        url: 'https://example.com/archive.zip',
      };
      const result = processor.processFile(file);
      expect(result.previewMode).toBe('none');
    });

    it('有内容的压缩文件应返回 modal 预览模式', () => {
      const file = {
        id: 'f1',
        name: 'archive.zip',
        content: 'PK',
      };
      const result = processor.processFile(file);
      expect(result.typeInference.category).toBe(FileCategory.Archive);
      expect(result.canPreview).toBe(true);
      expect(result.previewMode).toBe('modal');
    });

  });

  describe('便捷函数', () => {
    describe('isImageFile', () => {
      it('应该识别图片文件', () => {
        const file = { id: 'f1', name: 'photo.png' };
        expect(isImageFile(file)).toBe(true);
      });

      it('应该识别非图片文件', () => {
        const file = { id: 'f1', name: 'doc.txt' };
        expect(isImageFile(file)).toBe(false);
      });
    });

    describe('isVideoFile', () => {
      it('应该识别视频文件', () => {
        const file = { id: 'f1', name: 'movie.mp4' };
        expect(isVideoFile(file)).toBe(true);
      });

      it('应该识别非视频文件', () => {
        const file = { id: 'f1', name: 'doc.txt' };
        expect(isVideoFile(file)).toBe(false);
      });
    });

    describe('isPdfFile', () => {
      it('应该识别PDF文件', () => {
        const file = { id: 'f1', name: 'document.pdf' };
        expect(isPdfFile(file)).toBe(true);
      });

      it('应该识别非PDF文件', () => {
        const file = { id: 'f1', name: 'doc.txt' };
        expect(isPdfFile(file)).toBe(false);
      });
    });

    describe('isTextFile', () => {
      it('应该识别文本文件', () => {
        const file = { id: 'f1', name: 'document.txt' };
        expect(isTextFile(file)).toBe(true);
      });

      it('应该识别Markdown文件', () => {
        const file = { id: 'f1', name: 'README.md' };
        expect(isTextFile(file)).toBe(true);
      });

      it('应该识别非文本文件', () => {
        const file = { id: 'f1', name: 'image.png' };
        expect(isTextFile(file)).toBe(false);
      });
    });

    describe('isArchiveFile', () => {
      it('应该识别压缩文件', () => {
        const extensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];

        extensions.forEach((ext) => {
          const file = { id: `f-${ext}`, name: `archive.${ext}` };
          expect(isArchiveFile(file)).toBe(true);
        });
      });

      it('应该识别非压缩文件', () => {
        const file = { id: 'f1', name: 'doc.txt' };
        expect(isArchiveFile(file)).toBe(false);
      });
    });

    describe('isAudioFile', () => {
      it('应该识别音频文件', () => {
        const file = { id: 'f1', name: 'song.mp3' };
        expect(isAudioFile(file)).toBe(true);
      });

      it('应该识别非音频文件', () => {
        const file = { id: 'f1', name: 'doc.txt' };
        expect(isAudioFile(file)).toBe(false);
      });
    });

    describe('getMimeType', () => {
      it('应该获取文件的MIME类型', () => {
        const fileObj = new File(['pdf'], 'doc.pdf', {
          type: 'application/pdf',
        });
        const file = { id: 'f1', name: 'doc.pdf', file: fileObj };
        const mimeType = getMimeType(file);
        expect(mimeType).toBe('application/pdf');
      });

      it('应该为未知文件返回默认MIME类型', () => {
        const file = { id: 'f1', name: 'unknown' };
        const mimeType = getMimeType(file);
        expect(mimeType).toBe('application/octet-stream');
      });

      it('应该处理带内容的文件', () => {
        const file = { id: 'f1', name: 'test.txt', content: 'text' };
        const mimeType = getMimeType(file);
        expect(mimeType).toBe('text/plain');
      });

      it('应该处理带URL的文件', () => {
        const file = {
          id: 'f1',
          name: 'test.pdf',
          url: 'https://example.com/test.pdf',
        };
        const mimeType = getMimeType(file);
        // URL数据源的文件会推断MIME类型
        expect(mimeType).toContain('application/');
      });
    });
  });

  describe('全局实例', () => {
    it('应该导出全局fileTypeProcessor实例', () => {
      expect(fileTypeProcessor).toBeInstanceOf(FileTypeProcessor);
    });

    it('应该使用全局实例处理文件', () => {
      const file = { id: 'f1', name: 'test.pdf' };
      const result = fileTypeProcessor.processFile(file);
      expect(result.typeInference.fileType).toBe('pdf');
    });
  });

  describe('边缘情况', () => {
    it('应该处理没有名称的文件', () => {
      const file = { id: 'f1', name: '' };
      const result = processor.inferFileType(file);
      expect(result.fileType).toBe('plainText');
    });

    it('应该处理多个点的文件名', () => {
      const file = { id: 'f1', name: 'my.backup.tar.gz' };
      const result = processor.inferFileType(file);
      expect(result.category).toBe(FileCategory.Archive);
    });

    it('应该处理大小写混合的扩展名', () => {
      const file = { id: 'f1', name: 'Document.PDF' };
      const result = processor.inferFileType(file);
      expect(result.fileType).toBe('pdf');
    });

    it('应该优先使用type而不是文件名', () => {
      const file = {
        id: 'f1',
        name: 'file.txt',
        type: 'pdf' as const,
      };
      const result = processor.inferFileType(file);
      expect(result.fileType).toBe('pdf');
    });

    it('应该优先使用File对象的type', () => {
      const fileObj = new File(['content'], 'test.unknown', {
        type: 'application/pdf',
      });
      const file = { id: 'f1', name: 'test.unknown', file: fileObj };
      const result = processor.inferFileType(file);
      expect(result.fileType).toBe('pdf');
    });
  });
});
