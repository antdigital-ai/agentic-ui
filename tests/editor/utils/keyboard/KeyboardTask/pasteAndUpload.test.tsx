import { createEditor, Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../../../src/MarkdownEditor/editor/store';
import { KeyboardTask } from '../../../../../src/MarkdownEditor/editor/utils/keyboard';

// Mock dependencies
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => vi.fn()),
  },
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    readText: vi.fn(),
  },
  writable: true,
});

// Mock document.createElement
let mockInputElement: any;
const originalCreateElement = document.createElement;
vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  if (tagName === 'input') {
    mockInputElement = {
      id: '',
      type: 'file',
      accept: 'image/*',
      value: '',
      dataset: {} as any,
      onchange: vi.fn(),
      click: vi.fn(),
      remove: vi.fn(),
    };
    return mockInputElement;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock only Transforms methods to prevent undefined errors
vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => {});
vi.spyOn(Transforms, 'insertText').mockImplementation(() => {});
vi.spyOn(Transforms, 'delete').mockImplementation(() => {});
vi.spyOn(Transforms, 'select').mockImplementation(() => {});
vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {});
vi.spyOn(Transforms, 'wrapNodes').mockImplementation(() => {});
vi.spyOn(Transforms, 'unwrapNodes').mockImplementation(() => {});
vi.spyOn(Transforms, 'removeNodes').mockImplementation(() => {});

// Mock EditorUtils
vi.mock('../../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    toggleFormat: vi.fn(),
    clearMarks: vi.fn(),
    wrapperCardNode: vi.fn((node) => node),
    isTop: vi.fn(() => true),
    createMediaNode: vi.fn(() => ({ type: 'media', url: 'test.jpg' })),
    p: { type: 'paragraph', children: [{ text: '' }] },
    findPrev: vi.fn(() => [0]),
    findNext: vi.fn(() => [1]),
  },
}));

vi.mock('../../../../../src/MarkdownEditor/editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask - Paste and Upload Methods', () => {
  let editor: ReactEditor;
  let store: EditorStore;
  let keyboardTask: KeyboardTask;
  let mockProps: any;

  beforeEach(() => {
    editor = withReact(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'Test content' }],
      },
    ];

    store = {
      editor,
      markdownEditorRef: { current: null },
      setShowComment: vi.fn(),
    } as any;

    mockProps = {
      value: [{ type: 'paragraph', children: [{ text: 'Test content' }] }],
      onChange: vi.fn(),
      image: {
        upload: vi.fn(),
      },
    };

    keyboardTask = new KeyboardTask(store, mockProps);

    vi.clearAllMocks();
  });

  describe('pastePlainText', () => {
    it('应该粘贴纯文本到普通节点', async () => {
      const mockText = 'test text';
      (navigator.clipboard.readText as any).mockResolvedValue(mockText);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertTextSpy = vi.spyOn(Editor, 'insertText');

      await keyboardTask.pastePlainText();

      expect(insertTextSpy).toHaveBeenCalledWith(editor, mockText);
    });

    it('应该粘贴纯文本到表格单元格并替换换行符', async () => {
      const mockText = 'test\ntext';
      (navigator.clipboard.readText as any).mockResolvedValue(mockText);

      const mockNode = [{ type: 'table-cell', children: [{ text: '' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertTextSpy = vi.spyOn(Editor, 'insertText');

      await keyboardTask.pastePlainText();

      expect(insertTextSpy).toHaveBeenCalledWith(editor, 'test text');
    });

    it('当剪贴板为空时不应该执行任何操作', async () => {
      (navigator.clipboard.readText as any).mockResolvedValue('');

      const insertTextSpy = vi.spyOn(Editor, 'insertText');

      await keyboardTask.pastePlainText();

      expect(insertTextSpy).not.toHaveBeenCalled();
    });
  });

  describe('uploadImage', () => {
    it('应该创建文件输入元素并触发点击', () => {
      keyboardTask.uploadImage();

      expect(mockInputElement.type).toBe('file');
      expect(mockInputElement.accept).toBe('image/*');
      expect(mockInputElement.click).toHaveBeenCalled();
      expect(mockInputElement.remove).toHaveBeenCalled();
    });

    it('应该处理文件上传成功', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      const mockUrl = 'https://example.com/test.jpg';
      mockProps.image.upload.mockResolvedValue(mockUrl);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

      // 手动触发 onchange 事件
      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(mockProps.image.upload).toHaveBeenCalledWith(mockFiles);
      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该处理文件上传失败', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload.mockRejectedValue(new Error('Upload failed'));

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '图片上传失败:',
        expect.any(Error),
      );
      const { message } = await import('antd');
      expect(message.error).toHaveBeenCalledWith('图片上传失败');
    });

    it('当没有配置上传功能时应该显示错误', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload = undefined;

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      keyboardTask.uploadImage();

      // 手动触发 onchange 事件
      const mockEvent = {
        target: { files: mockFiles },
      };

      // 手动调用onchange事件处理函数
      const onchangeHandler = mockInputElement.onchange;
      await onchangeHandler(mockEvent);

      // 验证message.error被调用
      const { message } = await import('antd');
      expect(message.error).toHaveBeenCalledWith('图片上传功能未配置');
    });

    it('应该防止重复上传', async () => {
      // 先调用一次 uploadImage 来设置 readonly 状态
      keyboardTask.uploadImage();

      // 设置 readonly 状态
      mockInputElement.dataset.readonly = 'true';

      // 再次调用 uploadImage
      keyboardTask.uploadImage();

      // 第二次调用时，click 不应该被调用
      expect(mockInputElement.click).toHaveBeenCalledTimes(1);
    });

    it('onchange 时若 input.dataset.readonly 已设置应直接 return', async () => {
      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });
      keyboardTask.uploadImage();
      mockInputElement.dataset.readonly = 'true';
      const mockEvent = { target: { files: [new File([''], 'x.jpg', { type: 'image/jpeg' })] } };
      await mockInputElement.onchange(mockEvent);
      expect(mockProps.image.upload).not.toHaveBeenCalled();
    });

    it('column-cell 节点时 insertMedia 应使用 at [...node[1], 0]', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload.mockResolvedValue('https://example.com/test.jpg');
      const columnCellNode = [{ type: 'column-cell', children: [{ text: '' }] }, [0, 0] as any];
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([columnCellNode]),
        configurable: true,
      });
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');
      keyboardTask.uploadImage();
      await mockInputElement.onchange({ target: { files: mockFiles } });
      expect(insertNodesSpy).toHaveBeenCalledWith(
        editor,
        [expect.any(Object)],
        { at: [0, 0, 0] },
      );
    });

    it('应该处理空文件列表', async () => {
      const mockFiles: File[] = [];
      mockProps.image.upload.mockResolvedValue('https://example.com/test.jpg');

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      keyboardTask.uploadImage();

      // 手动触发 onchange 事件
      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(mockProps.image.upload).toHaveBeenCalledWith(mockFiles);
    });

    it('应该处理多个文件上传', async () => {
      const mockFiles = [
        new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        new File([''], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const mockUrls = [
        'https://example.com/test1.jpg',
        'https://example.com/test2.jpg',
      ];
      mockProps.image.upload.mockResolvedValue(mockUrls);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

      // 手动触发 onchange 事件
      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(insertNodesSpy).toHaveBeenCalledTimes(2);
    });

    it('应该处理空URL数组', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload.mockResolvedValue([]);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

      // 手动触发 onchange 事件
      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(insertNodesSpy).not.toHaveBeenCalled();
    });

    it('应该处理空编辑器的情况', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      const mockUrl = 'https://example.com/test.jpg';
      mockProps.image.upload.mockResolvedValue(mockUrl);

      // Mock curNodes getter to return empty array
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

      // 手动触发 onchange 事件
      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(insertNodesSpy).toHaveBeenCalledWith(
        editor,
        [expect.any(Object)],
        { select: true },
      );
    });
  });
});
