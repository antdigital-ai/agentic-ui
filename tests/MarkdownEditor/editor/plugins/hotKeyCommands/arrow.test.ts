/**
 * arrow.ts 测试用例
 *
 * 测试箭头键相关操作的处理逻辑
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Editor, Node, Path, Transforms, Range } from 'slate';
import { keyArrow } from '../../../../../src/MarkdownEditor/editor/plugins/hotKeyCommands/arrow';
import { EditorUtils } from '../../../../../src/MarkdownEditor/editor/utils/editorUtils';

// Mock EditorUtils
vi.mock('../../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(),
    moveBeforeSpace: vi.fn(),
    moveAfterSpace: vi.fn(),
    findPrev: vi.fn(),
    findNext: vi.fn(),
    checkSelEnd: vi.fn(),
    get p() {
      return { type: 'paragraph', children: [{ text: '' }] };
    }
  }
}));

// Mock is-hotkey
vi.mock('is-hotkey', () => ({
  default: vi.fn((hotkey, event) => {
    if (!event || !event.key) return false;
    
    switch (hotkey) {
      case 'mod+left':
        return event.key === 'ArrowLeft' && (event.ctrlKey || event.metaKey);
      case 'left':
        return event.key === 'ArrowLeft' && !event.ctrlKey && !event.metaKey;
      case 'right':
        return event.key === 'ArrowRight';
      case 'up':
        return event.key === 'ArrowUp';
      case 'down':
        return event.key === 'ArrowDown';
      default:
        return false;
    }
  })
}));

describe('arrow.ts', () => {
  let mockStore: any;
  let mockEditor: any;
  let mockEvent: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create mock editor
    mockEditor = {
      selection: null,
      children: [],
      isVoid: vi.fn().mockReturnValue(false),
      hasPath: vi.fn().mockReturnValue(true),
    };

    // Create mock store
    mockStore = {
      editor: mockEditor,
    };

    // Create mock event
    mockEvent = {
      key: '',
      ctrlKey: false,
      metaKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
  });

  describe('Mod+左箭头处理', () => {
    it('应该正确处理Mod+左箭头键', () => {
      mockEvent.key = 'ArrowLeft';
      mockEvent.ctrlKey = true;
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 5 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      keyArrow(mockStore, mockEvent);
      
      // Mod+左箭头应该直接返回，不执行其他逻辑
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('左箭头处理', () => {
    it('应该正确处理左箭头键 - media/attach元素前的光标移动', () => {
      mockEvent.key = 'ArrowLeft';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf
      (EditorUtils.isDirtLeaf as any).mockReturnValue(false);
      
      // Mock Editor.previous
      vi.spyOn(Editor, 'previous').mockReturnValue([
        { type: 'media', children: [{ text: '' }] },
        [0, -1]
      ] as any);
      
      // Mock Transforms.select
      const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
      // 应该调用 Transforms.select 移动到前一个元素
    });

    it('应该正确处理左箭头键 - 空白节点前的光标移动', () => {
      mockEvent.key = 'ArrowLeft';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf 返回true表示是脏叶子节点
      (EditorUtils.isDirtLeaf as any).mockReturnValue(true);
      
      // Mock Editor.previous
      vi.spyOn(Editor, 'previous').mockReturnValue(undefined);
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(EditorUtils.moveBeforeSpace).toHaveBeenCalled();
    });

    it('应该正确处理左箭头键 - void节点前的光标移动', () => {
      mockEvent.key = 'ArrowLeft';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 2], offset: 0 } // 使用 [0, 2] 而不是 [0, 1] 来避免负索引问题
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf
      (EditorUtils.isDirtLeaf as any).mockReturnValue(false);
      
      // Mock Editor.previous
      vi.spyOn(Editor, 'previous').mockReturnValue(undefined);
      
      // Mock Path.hasPrevious
      vi.spyOn(Path, 'hasPrevious')
        .mockReturnValueOnce(true) // sel.focus.path has previous ([0, 2] 有前一个 [0, 1])
        .mockReturnValueOnce(true) // Path.previous(sel.focus.path) has previous ([0, 1] 有前一个 [0, 0])
        .mockReturnValueOnce(true); // Path.previous(Path.previous(sel.focus.path)) has previous ([0, 0] 有前一个 [0, -1])
      
      // Mock Editor.isVoid
      mockEditor.isVoid.mockReturnValue(true);
      
      // Mock Node.get
      vi.spyOn(Node, 'get').mockReturnValue({});
      
      // Mock Editor.end
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, -2], offset: 0 });
      
      // Mock Transforms.select
      const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该正确处理左箭头键 - 默认光标移动', () => {
      mockEvent.key = 'ArrowLeft';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 5 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf
      (EditorUtils.isDirtLeaf as any).mockReturnValue(false);
      
      // Mock Editor.previous
      vi.spyOn(Editor, 'previous').mockReturnValue(undefined);
      
      // Mock Path.hasPrevious
      vi.spyOn(Path, 'hasPrevious').mockReturnValue(false);
      
      // Mock Transforms.move
      const moveSpy = vi.spyOn(Transforms, 'move').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(moveSpy).toHaveBeenCalledWith(mockEditor, { unit: 'offset', reverse: true });
    });
  });

  describe('右箭头处理', () => {
    it('应该正确处理右箭头键 - media元素后的光标移动', () => {
      mockEvent.key = 'ArrowRight';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 4 } // 假设文本长度为4
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf
      (EditorUtils.isDirtLeaf as any).mockReturnValue(false);
      
      // Mock Editor.next
      vi.spyOn(Editor, 'next').mockReturnValue([
        { type: 'media', children: [{ text: '' }] },
        [0, 1]
      ] as any);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {})());
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      // 应该调用 Transforms.select 移动到下一个元素
    });

    it('应该正确处理右箭头键 - 空白节点后的光标移动', () => {
      mockEvent.key = 'ArrowRight';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 4 } // 假设文本长度为4
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf 返回true
      (EditorUtils.isDirtLeaf as any).mockReturnValue(true);
      
      // Mock Editor.next
      vi.spyOn(Editor, 'next').mockReturnValue(undefined);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {})());
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(EditorUtils.moveAfterSpace).toHaveBeenCalled();
    });

    it('应该正确处理右箭头键 - void节点后的光标移动', () => {
      mockEvent.key = 'ArrowRight';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 4 } // 假设文本长度为4
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf
      (EditorUtils.isDirtLeaf as any).mockReturnValue(false);
      
      // Mock Editor.next
      vi.spyOn(Editor, 'next')
        .mockReturnValueOnce(undefined) // 第一次调用返回undefined
        .mockReturnValueOnce([{ type: 'media' }, [0, 1]] as any); // 第二次调用返回节点
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {})());
      
      // Mock Editor.isVoid
      mockEditor.isVoid.mockReturnValue(true);
      
      // Mock Node.get
      vi.spyOn(Node, 'get').mockReturnValue({});
      
      // Mock Editor.hasPath
      mockEditor.hasPath.mockReturnValue(true);
      
      // Mock Path.next
      vi.spyOn(Path, 'next')
        .mockReturnValueOnce([0, 1]) // 第一次调用
        .mockReturnValueOnce([0, 2]); // 第二次调用
      
      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [0, 2], offset: 0 });
      
      // Mock Transforms.select
      const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });

    it('应该正确处理右箭头键 - 默认光标移动', () => {
      mockEvent.key = 'ArrowRight';
      mockEvent.ctrlKey = false;
      mockEvent.metaKey = false;
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 2 } // 中间位置
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Node.leaf
      vi.spyOn(Node, 'leaf').mockReturnValue({ text: 'test' });
      
      // Mock EditorUtils.isDirtLeaf
      (EditorUtils.isDirtLeaf as any).mockReturnValue(false);
      
      // Mock Editor.next
      vi.spyOn(Editor, 'next').mockReturnValue(undefined);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {})());
      
      // Mock Editor.hasPath
      mockEditor.hasPath.mockReturnValue(false);
      
      // Mock Transforms.move
      const moveSpy = vi.spyOn(Transforms, 'move').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(moveSpy).toHaveBeenCalledWith(mockEditor, { unit: 'offset' });
    });

    it('应该正确处理Mod+右箭头键', () => {
      mockEvent.key = 'ArrowRight';
      mockEvent.ctrlKey = true; // Mod键按下
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 2 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Path.parent
      vi.spyOn(Path, 'parent').mockReturnValue([0]);
      
      // Mock Editor.end
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0], offset: 4 });
      
      // Mock Transforms.select
      const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('上箭头处理', () => {
    it('应该正确处理上箭头键 - media/attach元素的向上移动', () => {
      mockEvent.key = 'ArrowUp';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [1, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {
        yield [{ type: 'paragraph' }, [1, 0]] as any;
      })());
      
      // Mock EditorUtils.findPrev
      (EditorUtils.findPrev as any).mockReturnValue([0, 0]);
      
      // Mock Editor.node
      vi.spyOn(Editor, 'node').mockReturnValue([{ type: 'media' }, [0, 0]] as any);
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      // 应该调用 Transforms.select 移动到前一个元素
    });

    it('应该正确处理上箭头键 - media元素的处理', () => {
      mockEvent.key = 'ArrowUp';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [1, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {
        yield [{ type: 'media' }, [1, 0]] as any;
      })());
      
      // Mock EditorUtils.findPrev
      (EditorUtils.findPrev as any).mockReturnValue([0, 0]);
      
      // Mock Editor.end
      vi.spyOn(Editor, 'end').mockReturnValue({ path: [0, 0], offset: 0 });
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // 应该调用 Transforms.select 移动到前一个元素的末尾
    });
  });

  describe('下箭头处理', () => {
    it('应该正确处理下箭头键 - media/attach元素的向下移动', () => {
      mockEvent.key = 'ArrowDown';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {
        yield [{ type: 'paragraph' }, [0, 0]] as any;
      })());
      
      // Mock EditorUtils.findNext
      (EditorUtils.findNext as any)
        .mockReturnValueOnce([1, 0]) // 第一次调用
        .mockReturnValueOnce([1, 0]); // 第二次调用
      
      // Mock Editor.node
      vi.spyOn(Editor, 'node').mockReturnValue([{ type: 'media' }, [1, 0]] as any);
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      // 应该调用 Transforms.select 移动到下一个元素
    });

    it('应该正确处理下箭头键 - media元素的处理', () => {
      mockEvent.key = 'ArrowDown';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {
        yield [{ type: 'media' }, [0, 0]] as any;
      })());
      
      // Mock EditorUtils.findNext
      (EditorUtils.findNext as any).mockReturnValue([1, 0]);
      
      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [1, 0], offset: 0 });
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // 应该调用 Transforms.select 移动到下一个元素的开头
    });

    it('应该正确处理下箭头键 - 空段落的导航', () => {
      mockEvent.key = 'ArrowDown';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {
        yield [{ type: 'paragraph', children: [{ text: '' }] }, [0, 0]] as any;
      })());
      
      // Mock Node.string
      vi.spyOn(Node, 'string').mockReturnValue('');
      
      // Mock Path.parent
      vi.spyOn(Path, 'parent').mockReturnValue([]);
      
      // Mock Editor.isEditor
      vi.spyOn(Editor, 'isEditor').mockReturnValue(true);
      
      // Mock Editor.hasPath
      mockEditor.hasPath.mockReturnValue(true);
      
      // Mock Path.next
      vi.spyOn(Path, 'next').mockReturnValue([1, 0]);
      
      // Mock Editor.node
      vi.spyOn(Editor, 'node').mockReturnValue([{ type: 'table' }, [1, 0]] as any);
      
      // Mock Editor.start
      vi.spyOn(Editor, 'start').mockReturnValue({ path: [1, 0], offset: 0 });
      
      // Mock Transforms.delete
      vi.spyOn(Transforms, 'delete').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // 应该调用 Transforms.select 和 Transforms.delete
    });

    it('应该正确处理下箭头键 - 段落末尾插入新节点', () => {
      mockEvent.key = 'ArrowDown';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {
        yield [{ type: 'paragraph', children: [{ text: 'content' }] }, [0, 0]] as any;
      })());
      
      // Mock Node.string
      vi.spyOn(Node, 'string').mockReturnValue('content');
      
      // Mock EditorUtils.checkSelEnd
      (EditorUtils.checkSelEnd as any).mockReturnValue(true);
      
      // Mock Transforms.insertNodes
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => {});
      
      keyArrow(mockStore, mockEvent);
      
      expect(insertNodesSpy).toHaveBeenCalled();
    });
  });

  describe('边界条件处理', () => {
    it('应该在没有选区时直接返回', () => {
      mockEditor.selection = null;
      
      keyArrow(mockStore, mockEvent);
      
      // 应该没有任何操作被执行
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('应该在选区未折叠时直接返回', () => {
      mockEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(false);
      
      keyArrow(mockStore, mockEvent);
      
      // 应该没有任何操作被执行
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('应该在findNext返回undefined时直接返回', () => {
      mockEvent.key = 'ArrowDown';
      
      // 设置选区
      mockEditor.selection = {
        focus: { path: [0, 0], offset: 0 }
      };
      
      // Mock Range.isCollapsed
      vi.spyOn(Range, 'isCollapsed').mockReturnValue(true);
      
      // Mock Editor.nodes
      vi.spyOn(Editor, 'nodes').mockReturnValue((function*() {
        yield [{ type: 'paragraph' }, [0, 0]] as any;
      })());
      
      // Mock EditorUtils.findNext 返回undefined
      (EditorUtils.findNext as any).mockReturnValue(undefined);
      
      keyArrow(mockStore, mockEvent);
      
      // 应该没有任何操作被执行
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });
});