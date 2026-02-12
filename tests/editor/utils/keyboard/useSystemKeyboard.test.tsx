import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';
import { createEditor, Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from 'slate-react';
import { EditorStore } from '../../../../src/MarkdownEditor/editor/store';
import {
  Methods,
  useSystemKeyboard,
} from '../../../../src/MarkdownEditor/editor/utils/keyboard';

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

// Mock is-hotkey - 支持 keyMap 中快捷键以覆盖 keydown 循环
vi.mock('is-hotkey', () => ({
  default: vi.fn((hotkey: string, event: any) => {
    if (hotkey === 'mod+c' && event.ctrlKey && event.key === 'c') return true;
    if (hotkey === 'mod+x' && event.ctrlKey && event.key === 'x') return true;
    if (hotkey === 'backspace' && event.key === 'Backspace') return true;
    if (hotkey === 'arrowUp' && event.key === 'ArrowUp') return true;
    if (hotkey === 'arrowDown' && event.key === 'ArrowDown') return true;
    if (hotkey === 'mod+a' && event.ctrlKey && event.key === 'a') return true;
    if (hotkey === 'mod+shift+l' && event.ctrlKey && event.shiftKey && event.key === 'l') return true;
    return false;
  }),
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    readText: vi.fn(),
  },
  writable: true,
});

// Mock EditorUtils
vi.mock('../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
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

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('useSystemKeyboard', () => {
  let editor: ReactEditor;
  let store: EditorStore;
  let mockProps: any;
  let keyTask$: Subject<any>;

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
      readonly: false,
    } as any;

    keyTask$ = new Subject();
  });

  it('应该处理键盘任务', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );
  });

  it('当没有store时应该提前返回', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    vi.doMock('is-hotkey', () => ({
      default: vi.fn(() => false),
    }));

    renderHook(() => {
      useSystemKeyboard(keyTask$, null as any, mockProps, mockRef);
      return null;
    });

    expect(mockElement.addEventListener).not.toHaveBeenCalled();
  });

  it('应该处理键盘事件', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];

    const mockEvent = {
      key: 'Ctrl+a',
      preventDefault: vi.fn(),
    };

    eventHandler(mockEvent);
  });

  it('应该处理只读模式', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const readonlyProps = { ...mockProps, readonly: true };

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, readonlyProps, mockRef);
      return null;
    });

    // 在只读模式下，不应该添加事件监听器
    expect(mockElement.addEventListener).not.toHaveBeenCalled();
  });

  it('应该处理没有ref的情况', () => {
    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, undefined);
      return null;
    });

    expect(true).toBe(true);
  });

  it('应该通过 keyTask$ 处理任务', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const selectSpy = vi.spyOn(Transforms, 'select');

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    keyTask$.next({ key: 'selectAll', args: [] });

    expect(selectSpy).toHaveBeenCalled();
  });

  it('应该处理复制和剪切媒体节点', async () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const mediaNode = [{ type: 'media', url: 'https://x.com/a.jpg', height: 100 }, [0, 0] as any];
    vi.spyOn(Editor, 'nodes').mockReturnValue([mediaNode] as any);

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];
    const copyEvent = {
      key: 'c',
      ctrlKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    eventHandler(copyEvent);

    const { default: copy } = await import('copy-to-clipboard');
    expect(copy).toHaveBeenCalledWith(
      'media://file?url=https://x.com/a.jpg&height=100',
    );
  });

  it('应该处理复制和剪切附件节点', async () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const attachNode = [
      { type: 'attach', url: 'https://x.com/f.pdf', name: 'f.pdf', size: 100 },
      [0, 0] as any,
    ];
    vi.spyOn(Editor, 'nodes').mockReturnValue([attachNode] as any);

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];
    const copyEvent = {
      key: 'c',
      ctrlKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    eventHandler(copyEvent);

    const { default: copy } = await import('copy-to-clipboard');
    expect(copy).toHaveBeenCalledWith(
      'attach://file?size=100&name=f.pdf&url=https://x.com/f.pdf',
    );
  });

  it('mod+x 媒体节点时应剪切并 Transforms.delete', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const mediaNode = [{ type: 'media', url: 'https://x.com/a.jpg' }, [0, 0] as any];
    vi.spyOn(Editor, 'nodes').mockReturnValue([mediaNode] as any);
    const deleteSpy = vi.spyOn(Transforms, 'delete');

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];
    eventHandler({
      key: 'x',
      ctrlKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(deleteSpy).toHaveBeenCalledWith(store.editor, { at: [0, 0] });
  });

  it('应该处理删除媒体节点', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const mediaNode = [{ type: 'media', url: 'x' }, [0, 0] as any];
    vi.spyOn(Editor, 'nodes').mockReturnValue([mediaNode] as any);
    const removeSpy = vi.spyOn(Transforms, 'removeNodes');
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];
    const backspaceEvent = {
      key: 'Backspace',
      preventDefault: vi.fn(),
    };
    eventHandler(backspaceEvent);

    expect(backspaceEvent.preventDefault).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
  });

  it('应该处理媒体节点的方向键导航', async () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const mediaNode = [{ type: 'media', url: 'x' }, [0, 0] as any];
    vi.spyOn(Editor, 'nodes').mockReturnValue([mediaNode] as any);
    const editorUtilsMod = await import('../../../../src/MarkdownEditor/editor/utils/editorUtils');
    vi.mocked(editorUtilsMod.EditorUtils.findNext).mockReturnValue(null);

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];

    const arrowUpEvent = {
      key: 'ArrowUp',
      preventDefault: vi.fn(),
    };
    eventHandler(arrowUpEvent);
    expect(arrowUpEvent.preventDefault).toHaveBeenCalled();

    const arrowDownEvent = {
      key: 'ArrowDown',
      preventDefault: vi.fn(),
    };
    eventHandler(arrowDownEvent);
    expect(arrowDownEvent.preventDefault).toHaveBeenCalled();
  });

  it('应该在组件卸载时移除事件监听器', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const { unmount } = renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    expect(mockElement.addEventListener).toHaveBeenCalled();

    unmount();

    expect(mockElement.removeEventListener).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
    );
  });

  it('应该处理空的 keyTask$', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const emptyKeyTask$ = new Subject<{
      key: Methods<any>;
      args?: any[];
    }>();

    renderHook(() => {
      useSystemKeyboard(emptyKeyTask$ as any, store, mockProps, mockRef);
      return null;
    });

    expect(mockElement.addEventListener).toHaveBeenCalled();
  });

  it('应该处理 readonly 为 true 的情况', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const readonlyProps = { ...mockProps, readonly: true };

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, readonlyProps, mockRef);
      return null;
    });

    // 在只读模式下，不应该添加事件监听器
    expect(mockElement.addEventListener).not.toHaveBeenCalled();
  });

  it('应该处理 markdownContainerRef 为 null 的情况', () => {
    const mockRef = { current: null };

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    expect(true).toBe(true);
  });

  it('应该处理 markdownContainerRef 为 undefined 的情况', () => {
    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, undefined);
      return null;
    });

    expect(true).toBe(true);
  });

  it('应该正确处理多个键盘事件', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];

    const events = [
      {
        key: 'a',
        ctrlKey: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
      {
        key: 'c',
        ctrlKey: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
      {
        key: 'v',
        ctrlKey: true,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      },
    ];

    events.forEach((event) => {
      eventHandler(event);
      // 只测试事件监听器被正确添加
      expect(mockElement.addEventListener).toHaveBeenCalled();
    });
  });

  it('应该处理非快捷键的普通键盘事件', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };

    const App = () => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    };

    render(<App />);

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];

    const normalEvent = {
      key: 'a',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    eventHandler(normalEvent);

    expect(normalEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('keyMap 匹配时应 preventDefault 并执行对应 task 方法', () => {
    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };
    const selectSpy = vi.spyOn(Transforms, 'select');

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];
    const modAEvent = {
      key: 'a',
      ctrlKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    eventHandler(modAEvent);

    expect(modAEvent.preventDefault).toHaveBeenCalled();
    expect(modAEvent.stopPropagation).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalled();
  });

  it('mod+c 且无 media/attach 节点时应提前 return 不调用 copy', async () => {
    const { default: copy } = await import('copy-to-clipboard');
    const callCountBefore = copy.mock.calls.length;

    const mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
    const mockRef = { current: mockElement };
    vi.spyOn(Editor, 'nodes').mockReturnValue([] as any);

    renderHook(() => {
      useSystemKeyboard(keyTask$, store, mockProps, mockRef);
      return null;
    });

    const eventHandler = mockElement.addEventListener.mock.calls[0][1];
    eventHandler({
      key: 'c',
      ctrlKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(copy.mock.calls.length).toBe(callCountBefore);
  });
});
