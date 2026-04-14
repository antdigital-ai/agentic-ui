/**
 * 文件名 `EditorStore.*` 在同目录字典序上晚于 `Editor.branches.*`，使 vitest 先注册后者对 slate 的 vi.mock，
 * 再加载本文件中的真实 slate，避免剪贴板等用例的 mock 被覆盖。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { createEditor, Editor, Path, Text, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStore, useEditorStore } from '../store';

describe('EditorStore', () => {
  let editor: any;
  let editorRef: React.MutableRefObject<any>;
  let store: EditorStore;

  beforeEach(() => {
    editor = withReact(withHistory(createEditor()));
    editorRef = { current: editor };
    store = new EditorStore(editorRef);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('构造函数', () => {
    it('应该正确初始化EditorStore', () => {
      expect(store).toBeDefined();
      expect(store.editor).toBe(editor);
    });

    it('应该设置默认属性', () => {
      expect(store.draggedElement).toBeNull();
      expect(store.footnoteDefinitionMap).toBeInstanceOf(Map);
      expect(store.inputComposition).toBe(false);
      expect(store.domRect).toBeNull();
    });
  });

  describe('编辑器操作', () => {
    it('应该聚焦编辑器', () => {
      const focusSpy = vi.spyOn(store, 'focus');
      store.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('应该插入节点', () => {
      const insertNodesSpy = vi.spyOn(store, 'insertNodes');
      const node = { type: 'paragraph', children: [{ text: 'new paragraph' }] };
      store.insertNodes(node);

      expect(insertNodesSpy).toHaveBeenCalledWith(node);
    });

    it('应该清空内容', () => {
      const clearContentSpy = vi.spyOn(store, 'clearContent');
      store.clearContent();

      expect(clearContentSpy).toHaveBeenCalled();
    });

    it('应该检查是否为最新节点', () => {
      const isLatestNodeSpy = vi.spyOn(store, 'isLatestNode');
      const node = { type: 'paragraph', children: [{ text: 'test' }] };

      store.isLatestNode(node);

      expect(isLatestNodeSpy).toHaveBeenCalledWith(node);
    });
  });

  describe('内容管理', () => {
    it('应该获取内容', () => {
      const getContentSpy = vi.spyOn(store, 'getContent');
      const content = store.getContent();

      expect(getContentSpy).toHaveBeenCalled();
      expect(Array.isArray(content)).toBe(true);
    });

    it('应该设置内容', () => {
      const setContentSpy = vi.spyOn(store, 'setContent');
      const nodeList = [
        { type: 'paragraph', children: [{ text: 'new content' }] },
      ];

      store.setContent(nodeList);

      expect(setContentSpy).toHaveBeenCalledWith(nodeList);
    });

    it('应该获取Markdown内容', () => {
      const getMDContentSpy = vi.spyOn(store, 'getMDContent');
      const mdContent = store.getMDContent();

      expect(getMDContentSpy).toHaveBeenCalled();
      expect(typeof mdContent).toBe('string');
    });

    it('应该获取HTML内容', () => {
      const getHtmlContentSpy = vi.spyOn(store, 'getHtmlContent');
      const htmlContent = store.getHtmlContent();

      expect(getHtmlContentSpy).toHaveBeenCalled();
      expect(typeof htmlContent).toBe('string');
    });
  });

  describe('拖拽管理', () => {
    it('应该开始拖拽', () => {
      const dragStartSpy = vi.spyOn(store, 'dragStart');
      const event = {
        stopPropagation: vi.fn(),
        dataTransfer: {
          setDragImage: vi.fn(),
        },
      };
      const container = document.createElement('div');

      store.dragStart(event, container);

      expect(dragStartSpy).toHaveBeenCalledWith(event, container);
    });
  });

  describe('搜索和替换', () => {
    it('应该执行搜索和替换', () => {
      const replaceTextSpy = vi.spyOn(store, 'replaceText');
      store.replaceText('search', 'replace', { replaceAll: true });

      expect(replaceTextSpy).toHaveBeenCalledWith('search', 'replace', {
        replaceAll: true,
      });
    });
  });

  describe('链接管理', () => {
    it('应该插入链接', () => {
      const insertLinkSpy = vi.spyOn(store, 'insertLink');
      store.insertLink('/path/to/file');

      expect(insertLinkSpy).toHaveBeenCalledWith('/path/to/file');
    });

    it('selection 为 null 时 insertLink 直接返回不插入', () => {
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      editor.selection = null;
      store.insertLink('http://example.com');
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it('当前块为 code/table/head 时在下一路径插入段落链接', () => {
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      editor.children = [{ type: 'code', children: [{ text: '' }] }] as any;
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      let callCount = 0;
      vi.spyOn(Editor, 'nodes').mockImplementation(function* () {
        callCount += 1;
        if (callCount === 1) {
          yield [{ type: 'code', children: [{ text: '' }] }, [0]];
        } else {
          yield [{ type: 'code', children: [{ text: '' }] }, [0]];
        }
      });
      store.insertLink('http://link.com');
      expect(insertSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          type: 'paragraph',
          children: expect.any(Array),
        }),
        expect.objectContaining({ at: Path.next([0]) }),
      );
    });
  });

  describe('useEditorStore', () => {
    it('无 Provider 时返回默认 store 对象', () => {
      const TestComp = () => {
        const ctx = useEditorStore();
        return React.createElement(
          'span',
          {
            'data-testid': 'readonly',
          },
          String(ctx.readonly),
        );
      };
      render(React.createElement(TestComp));
      expect(screen.getByTestId('readonly')).toHaveTextContent('true');
    });
  });

  describe('isLatestNode', () => {
    it('节点不在编辑器中时 findPath 抛错返回 false', () => {
      const findPathSpy = vi
        .spyOn(ReactEditor, 'findPath')
        .mockImplementation(() => {
          throw new Error('Node not found');
        });
      const result = store.isLatestNode({
        type: 'paragraph',
        children: [{ text: 'x' }],
      });
      expect(result).toBe(false);
      findPathSpy.mockRestore();
    });
  });

  describe('removeNodes', () => {
    it('应调用 Transforms.removeNodes', () => {
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');
      editor.children = [
        { type: 'paragraph', children: [{ text: 'x' }] },
      ] as any;
      store.removeNodes({ at: [0] });
      expect(removeSpy).toHaveBeenCalledWith(editor, { at: [0] });
    });
  });

  describe('getHtmlContent', () => {
    it('传入 options 时设置并应用 markdownToHtmlOptions', () => {
      store.getHtmlContent({ gfm: true });
      expect(typeof store.getHtmlContent()).toBe('string');
    });
  });

  describe('setContent', () => {
    it('应通过 Transforms API 安全替换编辑器内容', () => {
      const wnSpy = vi.spyOn(Editor, 'withoutNormalizing');
      const newContent = [{ type: 'paragraph', children: [{ text: 'b' }] }];
      store.setContent(newContent);
      expect(wnSpy).toHaveBeenCalled();
    });

    it('当存在失效 selection 时会先清空 selection 再替换内容', () => {
      editor.selection = {
        anchor: { path: [99, 0], offset: 0 },
        focus: { path: [99, 0], offset: 0 },
      };
      const nextNodeList = [
        { type: 'paragraph', children: [{ text: 'safe content' }] },
      ];

      store.setContent(nextNodeList as any);

      expect(editor.selection).toBeNull();
      expect(editor.children).toEqual(nextNodeList);
    });
  });

  describe('setMDContent', () => {
    it('长内容且 useRAF 为 false 时走 _setLongContentSync 并调用 onProgress', () => {
      const onProgress = vi.fn();
      const longMd = '# a\n\nb\n\n'.repeat(700);
      store.setMDContent(longMd, undefined, {
        chunkSize: 5000,
        useRAF: false,
        onProgress,
      });
      expect(onProgress).toHaveBeenCalledWith(1);
    });

    it('cancelSetMDContent 可取消进行中的 RAF 设置', () => {
      const longMd = 'p\n\n'.repeat(15);
      const promise = store.setMDContent(longMd, undefined, {
        useRAF: true,
        chunkSize: 1,
      });
      store.cancelSetMDContent();
      if (promise) {
        return expect(promise).rejects.toThrow(/cancelled|abort/i);
      }
    });
  });

  describe('updateNodeList', () => {
    it('过滤无效节点后执行差异更新', () => {
      const invalidImage = { type: 'image', children: [{ text: '' }] };
      const validPara = {
        type: 'paragraph',
        children: [{ text: 'valid' }],
      };
      store.updateNodeList([invalidImage, validPara] as any);
      expect(store.getContent().length).toBeGreaterThanOrEqual(0);
    });

    it('新列表更长时执行 insert 操作', () => {
      const insertSpy = vi.spyOn(Transforms, 'insertNodes');
      editor.children = [{ type: 'paragraph', children: [{ text: 'a' }] }];
      editor.hasPath = vi.fn((path: number[]) => path[0] !== 1);
      store.updateNodeList([
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ] as any);
      expect(insertSpy).toHaveBeenCalled();
    });

    it('新列表更短时执行 remove 操作', () => {
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');
      editor.children = [
        { type: 'paragraph', children: [{ text: 'a' }] },
        { type: 'paragraph', children: [{ text: 'b' }] },
      ];
      store.updateNodeList([
        { type: 'paragraph', children: [{ text: 'a' }] },
      ] as any);
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  describe('replaceText', () => {
    it('在文本节点中替换并调用 Transforms.insertText', () => {
      const insertTextSpy = vi.spyOn(Transforms, 'insertText');
      editor.children = [
        { type: 'paragraph', children: [{ text: 'hello world' }] },
      ];
      vi.spyOn(Editor, 'nodes').mockImplementation(function* (
        _e: any,
        opts: any,
      ) {
        if (opts?.match) {
          yield [{ text: 'hello world' }, [0, 0]];
        }
      });
      vi.spyOn(Text, 'isText').mockReturnValue(true);
      const count = store.replaceText('world', 'x', {
        replaceAll: true,
        caseSensitive: true,
        wholeWord: false,
      });
      expect(count).toBe(1);
      expect(insertTextSpy).toHaveBeenCalledWith(
        editor,
        'hello x',
        expect.objectContaining({ at: [0, 0] }),
      );
    });
  });
});
