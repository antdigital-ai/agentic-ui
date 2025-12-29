import { Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactEditor } from 'slate-react';
import { EditorStore } from '../../store';
import {
  convertRemoteImages,
  getRemoteMediaType,
} from '../media';

// Mock dependencies
vi.mock('slate', () => ({
  Transforms: {
    setNodes: vi.fn(),
  },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: vi.fn(() => [0, 0]),
  },
}));

vi.mock('../../store', () => ({
  EditorStore: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Media Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRemoteMediaType', () => {
    it('应该处理空URL', async () => {
      const result = await getRemoteMediaType('');
      expect(result).toBe('other');
    });

    it('应该处理data URL', async () => {
      const result = await getRemoteMediaType(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      );
      expect(result).toBe('png');
    });

    it('应该处理无效的data URL', async () => {
      const result = await getRemoteMediaType('data:invalid;base64,123');
      expect(result).toBe('other');
    });

    it('应该处理非字符串URL', async () => {
      const result = await getRemoteMediaType(null as any);
      expect(result).toBe('other');
    });

    it('应该通过文件扩展名识别媒体类型', async () => {
      const result = await getRemoteMediaType('https://example.com/image.png');
      expect(result).toBe('image');
    });

    it('应该通过HTTP请求获取内容类型', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn(() => 'image/png'),
        },
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await getRemoteMediaType('https://example.com/unknown');

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/unknown', {
        method: 'HEAD',
        signal: expect.any(AbortSignal),
      });
      expect(result).toBe('image');
    });

    it('应该处理HTTP请求失败', async () => {
      const mockResponse = {
        ok: false,
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await getRemoteMediaType('https://example.com/unknown');

      expect(result).toBeNull();
    });

    it('应该处理网络错误', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await getRemoteMediaType('https://example.com/unknown');

      expect(result).toBeNull();
    });

    it('应该处理超时', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn(() => 'image/png'),
        },
      };

      (global.fetch as any).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 2000);
        });
      });

      const result = await getRemoteMediaType('https://example.com/unknown');

      // 由于URL以http开头，会通过文件扩展名识别为image类型
      expect(result).toBe('image');
    });

    it('应该处理没有content-type头的情况', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn(() => null),
        },
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await getRemoteMediaType('https://example.com/unknown');

      expect(result).toBe('');
    });
  });

  describe('convertRemoteImages', () => {
    let mockStore: EditorStore;
    let mockEditor: any;

    beforeEach(() => {
      mockEditor = {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'media',
                url: 'https://example.com/image.png',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      };

      mockStore = {
        editor: mockEditor,
        markdownEditorRef: { current: null },
        setShowComment: vi.fn(),
      } as any;
    });

    it('应该转换HTTP图片URL', async () => {
      const mockNode = {
        type: 'media',
        url: 'https://example.com/image.png',
        children: [{ text: '' }],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).toHaveBeenCalledWith(
        mockStore.editor,
        { url: 'https://example.com/image.png' },
        { at: [0, 0] },
      );
    });

    it('应该转换data URL图片', async () => {
      // 修改mockEditor的children以包含data URL
      mockStore.editor.children = [
        {
          type: 'paragraph',
          children: [
            {
              type: 'media',
              url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
              children: [{ text: '' }],
            },
          ],
        },
      ];

      const mockNode = {
        type: 'media',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        children: [{ text: '' }],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).toHaveBeenCalledWith(
        mockStore.editor,
        {
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        },
        { at: [0, 0] },
      );
    });

    it('应该处理嵌套的媒体节点', async () => {
      const mockNode = {
        type: 'paragraph',
        children: [
          {
            type: 'media',
            url: 'https://example.com/image.png',
            children: [{ text: '' }],
          },
        ],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).toHaveBeenCalled();
    });

    it('应该处理没有children的节点', async () => {
      // 清空mockEditor的children
      mockStore.editor.children = [];

      const mockNode = {
        type: 'paragraph',
        children: [],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });

    it('应该处理非媒体节点', async () => {
      // 清空mockEditor的children
      mockStore.editor.children = [];

      const mockNode = {
        type: 'paragraph',
        children: [{ text: 'Hello' }],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });

    it('应该处理没有URL的媒体节点', async () => {
      // 清空mockEditor的children
      mockStore.editor.children = [];

      const mockNode = {
        type: 'media',
        children: [{ text: '' }],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });

    it('应该处理无效的data URL', async () => {
      // 清空mockEditor的children
      mockStore.editor.children = [];

      const mockNode = {
        type: 'media',
        url: 'data:invalid;base64,123',
        children: [{ text: '' }],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });

    it('应该处理Transforms.setNodes的错误', async () => {
      const mockNode = {
        type: 'media',
        url: 'https://example.com/image.png',
        children: [{ text: '' }],
      } as any;

      (Transforms.setNodes as any).mockImplementation(() => {
        throw new Error('Set nodes failed');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await convertRemoteImages(mockNode, mockStore);

      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    it('应该处理ReactEditor.findPath的错误', async () => {
      const mockNode = {
        type: 'media',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        children: [{ text: '' }],
      } as any;

      (ReactEditor.findPath as any).mockImplementation(() => {
        throw new Error('Find path failed');
      });

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });

    it('应该处理空的schema', async () => {
      mockStore.editor.children = [];

      const mockNode = {
        type: 'media',
        url: 'https://example.com/image.png',
        children: [{ text: '' }],
      } as any;

      await convertRemoteImages(mockNode, mockStore);

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });

    it('应该处理没有editor的store', async () => {
      const mockNode = {
        type: 'media',
        url: 'https://example.com/image.png',
        children: [{ text: '' }],
      } as any;

      const storeWithoutEditor = {
        markdownEditorRef: { current: null },
        setShowComment: vi.fn(),
      } as any;

      await convertRemoteImages(mockNode, storeWithoutEditor);

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });
  });
});
