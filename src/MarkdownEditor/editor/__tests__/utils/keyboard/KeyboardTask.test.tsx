import { createEditor, Editor, Node, Path, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../@ant-design/agentic-ui/MarkdownEditor/editor/store';
import { EditorUtils } from '../../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/editorUtils';
import { KeyboardTask } from '../../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/keyboard';

// Mock dependencies
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => vi.fn()), // 返回一个函数来模拟 hideLoading
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

// Mock Editor methods to prevent path errors
vi.spyOn(Editor, 'start').mockImplementation(() => ({
  path: [0, 0],
  offset: 0,
}));
vi.spyOn(Editor, 'end').mockImplementation(() => ({ path: [0, 0], offset: 0 }));
vi.spyOn(Editor, 'hasPath').mockImplementation(() => false);

// Mock EditorUtils
vi.mock('../../../@ant-design/agentic-ui/MarkdownEditor/editor/utils/editorUtils', () => ({
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

vi.mock('../../../@ant-design/agentic-ui/MarkdownEditor/editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask', () => {
  let editor: ReactEditor;
  let store: EditorStore;
  let keyboardTask: KeyboardTask;
  let mockProps: any;

  beforeEach(() => {
    // Create editor with initial content
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

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('selectAll', () => {
    it('应该选择编辑器中的所有内容', () => {
      const selectSpy = vi.spyOn(Transforms, 'select');
      const startSpy = vi.spyOn(Editor, 'start');
      const endSpy = vi.spyOn(Editor, 'end');

      keyboardTask.selectAll();

      expect(startSpy).toHaveBeenCalledWith(editor, []);
      expect(endSpy).toHaveBeenCalledWith(editor, []);
      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: expect.any(Object),
        focus: expect.any(Object),
      });
    });
  });

  describe('selectLine', () => {
    it('应该选择当前行的文本', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;

      const selectSpy = vi.spyOn(Transforms, 'select');
      const parentSpy = vi.spyOn(Path, 'parent');

      keyboardTask.selectLine();

      expect(parentSpy).toHaveBeenCalledWith(mockSelection.anchor.path);
      expect(selectSpy).toHaveBeenCalledWith(editor, expect.any(Array));
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectLine();

      expect(selectSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectFormatToCode', () => {
    it('应该将选中文本转换为行内代码', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;

      const toggleFormatSpy = vi.spyOn(EditorUtils, 'toggleFormat');

      keyboardTask.selectFormatToCode();

      expect(toggleFormatSpy).toHaveBeenCalledWith(editor, 'code');
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const toggleFormatSpy = vi.spyOn(EditorUtils, 'toggleFormat');

      keyboardTask.selectFormatToCode();

      expect(toggleFormatSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectWord', () => {
    it('应该选择英文单词', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
    });

    it('应该选择中文字符', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: '你好世界' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
    });

    it('应该处理混合文本', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello你好' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('当选区不是折叠状态时不应该执行任何操作', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;
      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('应该处理单个字符的情况', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'a' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalledWith(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      });
    });

    it('应该处理边界情况 - 光标在文本开头', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该处理边界情况 - 光标在文本结尾', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该处理空格分隔的单词', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      };
      editor.selection = mockSelection;
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'hello world test' }],
        },
      ];

      const selectSpy = vi.spyOn(Transforms, 'select');

      keyboardTask.selectWord();

      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('pastePlainText', () => {
    it('应该粘贴纯文本到普通节点', async () => {
      const mockText = 'test text';
      (navigator.clipboard.readText as any).mockResolvedValue(mockText);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertTextSpy = vi.spyOn(Editor, 'insertText');

      await keyboardTask.pastePlainText();

      expect(insertTextSpy).toHaveBeenCalledWith(editor, mockText);
    });

    it('应该粘贴纯文本到表格单元格并替换换行符', async () => {
      const mockText = 'test\ntext';
      (navigator.clipboard.readText as any).mockResolvedValue(mockText);

      const mockNode = [{ type: 'table-cell', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

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
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

      // 模拟文件选择事件
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

      keyboardTask.uploadImage();

      // 模拟文件选择事件
      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '图片上传失败:',
        expect.any(Error),
      );
    });

    it('当没有配置上传功能时应该显示错误', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload = undefined;

      const { message } = await import('antd');

      keyboardTask.uploadImage();

      // 模拟文件选择事件
      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

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

    it('应该处理空文件列表', async () => {
      const mockFiles: File[] = [];
      mockProps.image.upload.mockResolvedValue('https://example.com/test.jpg');

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      keyboardTask.uploadImage();

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
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

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
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

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

      // Mock curNodes to return empty array
      vi.spyOn(Editor, 'nodes').mockReturnValue([] as any);

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.uploadImage();

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

  describe('head', () => {
    it('应该设置标题级别', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.head(3);

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'head', level: 3 },
        { at: [0] },
      );
    });

    it('当级别为4时应该转换为普通段落', () => {
      const paragraphSpy = vi.spyOn(keyboardTask, 'paragraph');

      keyboardTask.head(4);

      expect(paragraphSpy).toHaveBeenCalled();
    });

    it('当节点类型不支持时不应该执行任何操作', () => {
      const mockNode = [{ type: 'code', children: [{ text: 'Test' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.head(1);

      expect(setNodesSpy).not.toHaveBeenCalled();
    });
  });

  describe('paragraph', () => {
    it('应该转换为普通段落', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      // Mock curNodes to return a head node
      const mockNode = [
        { type: 'head', level: 2, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.paragraph();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: [0] },
      );
    });

    it('当节点类型不是标题时不应该执行任何操作', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.paragraph();

      expect(setNodesSpy).not.toHaveBeenCalled();
    });
  });

  describe('increaseHead', () => {
    it('应该增加标题级别', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.increaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'head', level: 4 },
        { at: [0] },
      );
    });

    it('应该将1级标题转换为普通段落', () => {
      const mockNode = [
        { type: 'head', level: 1, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.increaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: [0] },
      );
    });

    it('应该将其他级别标题升级一级', () => {
      const mockNode = [
        { type: 'head', level: 2, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.increaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { level: 1 },
        { at: [0] },
      );
    });
  });

  describe('decreaseHead', () => {
    it('应该减少标题级别', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.selection = mockSelection;

      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.decreaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'head', level: 1 },
        { at: [0] },
      );
    });

    it('应该将4级标题转换为普通段落', () => {
      const mockNode = [
        { type: 'head', level: 4, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.decreaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { type: 'paragraph' },
        { at: [0] },
      );
    });

    it('应该将其他级别标题降级一级', () => {
      const mockNode = [
        { type: 'head', level: 2, children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      keyboardTask.decreaseHead();

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { level: 3 },
        { at: [0] },
      );
    });
  });

  describe('insertQuote', () => {
    it('应该插入引用块', () => {
      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const wrapNodesSpy = vi.spyOn(Transforms, 'wrapNodes');

      keyboardTask.insertQuote();

      expect(wrapNodesSpy).toHaveBeenCalledWith(editor, {
        type: 'blockquote',
        children: [],
      });
    });

    it('应该移除现有的引用块', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0, 0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);
      vi.spyOn(Node, 'parent').mockReturnValue({
        type: 'blockquote',
        children: [],
      } as any);

      const unwrapNodesSpy = vi.spyOn(Transforms, 'unwrapNodes');

      keyboardTask.insertQuote();

      expect(unwrapNodesSpy).toHaveBeenCalledWith(editor, { at: [0] });
    });

    it('当节点类型不支持时不应该执行任何操作', () => {
      const mockNode = [{ type: 'code', children: [{ text: 'Test' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const wrapNodesSpy = vi.spyOn(Transforms, 'wrapNodes');

      keyboardTask.insertQuote();

      expect(wrapNodesSpy).not.toHaveBeenCalled();
    });
  });

  describe('insertTable', () => {
    it('应该插入表格', () => {
      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.insertTable();

      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该在列单元格中插入表格', () => {
      const mockNode = [
        { type: 'column-cell', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.insertTable();

      expect(insertNodesSpy).toHaveBeenCalled();
    });
  });

  describe('insertCode', () => {
    it('应该插入代码块', () => {
      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.insertCode();

      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该插入指定类型的代码块', () => {
      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.insertCode('mermaid');

      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该插入HTML代码块', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];

      // Mock curNodes getter
      Object.defineProperty(keyboardTask, 'curNodes', {
        get: vi.fn().mockReturnValue([mockNode]),
        configurable: true,
      });

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.insertCode('html');

      expect(insertNodesSpy).toHaveBeenCalled();
    });
  });

  describe('horizontalLine', () => {
    it('应该插入水平线', () => {
      // Mock curNodes to return a paragraph node
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.horizontalLine();

      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该在水平线后插入段落', () => {
      const mockNode = [
        { type: 'paragraph', children: [{ text: 'Test' }] },
        [0],
      ];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);
      vi.spyOn(Editor, 'hasPath').mockReturnValue(false);

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      keyboardTask.horizontalLine();

      expect(insertNodesSpy).toHaveBeenCalledTimes(2); // 一次插入水平线，一次插入段落
    });
  });

  describe('format', () => {
    it('应该应用指定格式', () => {
      const toggleFormatSpy = vi.spyOn(EditorUtils, 'toggleFormat');

      keyboardTask.format('bold');

      expect(toggleFormatSpy).toHaveBeenCalledWith(editor, 'bold');
    });
  });

  describe('clear', () => {
    it('应该清除格式', () => {
      const mockSelection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      editor.selection = mockSelection;

      const clearMarksSpy = vi.spyOn(EditorUtils, 'clearMarks');

      keyboardTask.clear();

      expect(clearMarksSpy).toHaveBeenCalledWith(editor, true);
    });

    it('当没有选区时不应该执行任何操作', () => {
      editor.selection = null;
      const clearMarksSpy = vi.spyOn(EditorUtils, 'clearMarks');

      keyboardTask.clear();

      expect(clearMarksSpy).not.toHaveBeenCalled();
    });
  });

  describe('undo', () => {
    it('应该执行撤销操作', () => {
      // Mock the editor's undo method
      //@ts-ignore
      editor.undo = vi.fn() as any;

      const undoSpy = vi.spyOn(editor, 'undo' as any);

      keyboardTask.undo();

      expect(undoSpy).toHaveBeenCalled();
    });

    it('应该处理撤销操作异常', () => {
      // Mock the editor's undo method to throw an error
      //@ts-ignore
      editor.undo = vi.fn(() => {
        throw new Error('Undo failed');
      });

      expect(() => keyboardTask.undo()).not.toThrow();
    });
  });

  describe('redo', () => {
    it('应该执行重做操作', () => {
      // Mock the editor's redo method
      //@ts-ignore
      editor.redo = vi.fn();

      const redoSpy = vi.spyOn(editor, 'redo' as any);

      keyboardTask.redo();

      expect(redoSpy).toHaveBeenCalled();
    });

    it('应该处理重做操作异常', () => {
      // Mock the editor's redo method to throw an error
      //@ts-ignore
      editor.redo = vi.fn(() => {
        throw new Error('Redo failed');
      });

      expect(() => keyboardTask.redo()).not.toThrow();
    });
  });
});
