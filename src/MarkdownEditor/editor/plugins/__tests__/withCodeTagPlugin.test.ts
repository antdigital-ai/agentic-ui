import { createEditor, Editor, Node, Path, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { withCodeTagPlugin } from '../withCodeTagPlugin';

const tagNode = (text: string, extra?: Record<string, any>) => ({
  text,
  tag: true,
  code: true,
  ...extra,
});

const para = (...children: any[]) => ({
  type: 'paragraph',
  children,
});

describe('withCodeTagPlugin', () => {
  // ================================================================
  // remove_text
  // ================================================================

  describe('remove_text', () => {
    it('空 tag 删除时转为普通文本', () => {
      const editor = withCodeTagPlugin(createEditor());
      editor.children = [para(tagNode('  '))];

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');
      editor.apply({
        type: 'remove_text',
        path: [0, 0],
        offset: 0,
        text: ' ',
      });

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ tag: false, code: false, text: ' ' }),
        expect.objectContaining({ at: [0, 0] }),
      );
      setNodesSpy.mockRestore();
    });

    it('删除全部文本时重置为空 tag', () => {
      const editor = withCodeTagPlugin(createEditor());
      editor.children = [para(tagNode('abc'))];

      const removeNodesSpy = vi.spyOn(Transforms, 'removeNodes');
      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      editor.apply({
        type: 'remove_text',
        path: [0, 0],
        offset: 0,
        text: 'abc',
      });

      expect(removeNodesSpy).toHaveBeenCalled();
      expect(insertNodesSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ tag: true, code: true, text: ' ' }),
        expect.any(Object),
      );
      removeNodesSpy.mockRestore();
      insertNodesSpy.mockRestore();
    });

    it('部分删除 tag 内文本时直接 apply', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para(tagNode('hello'))];

      editor.apply({
        type: 'remove_text',
        path: [0, 0],
        offset: 0,
        text: 'he',
      });

      expect(originalApply).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'remove_text', text: 'he' }),
      );
    });

    it('非 tag 节点的 remove_text 透传', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para({ text: 'hello' })];

      editor.apply({
        type: 'remove_text',
        path: [0, 0],
        offset: 0,
        text: 'h',
      });

      expect(originalApply).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'remove_text' }),
      );
    });
  });

  // ================================================================
  // insert_text
  // ================================================================

  describe('insert_text', () => {
    it('空 tag 输入第一个字符时直接 apply（修复崩溃）', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para(tagNode('$ ', { triggerText: '$' }))];
      editor.selection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      };

      editor.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 2,
        text: '任',
      });

      expect(originalApply).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'insert_text', text: '任' }),
      );
    });

    it('空 tag 输入多个字符时直接 apply', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para(tagNode('  '))];
      editor.selection = {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      };

      editor.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 2,
        text: 'hello',
      });

      expect(originalApply).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'insert_text', text: 'hello' }),
      );
    });

    it('tag 末尾连续两个空格时跳出到节点外', () => {
      const editor = withCodeTagPlugin(createEditor());
      editor.children = [para(tagNode('abc '))];
      editor.selection = {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      };

      const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

      editor.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 4,
        text: ' ',
      });

      expect(insertNodesSpy).toHaveBeenCalledWith(editor, [{ text: ' ' }]);
      insertNodesSpy.mockRestore();
    });

    it('tag 末尾第一个空格不跳出', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para(tagNode('abc'))];
      editor.selection = {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      };

      editor.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: ' ',
      });

      expect(originalApply).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'insert_text', text: ' ' }),
      );
    });

    it('非 tag 节点的 insert_text 透传', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para({ text: 'hello' })];
      editor.selection = {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      };

      editor.apply({
        type: 'insert_text',
        path: [0, 0],
        offset: 5,
        text: 'x',
      });

      expect(originalApply).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'insert_text' }),
      );
    });
  });

  // ================================================================
  // split_node
  // ================================================================

  describe('split_node', () => {
    it('tag 节点吞掉 split_node（禁止回车拆分）', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para(tagNode('hello'))];

      editor.apply({
        type: 'split_node',
        path: [0, 0],
        position: 3,
        properties: {},
      });

      expect(originalApply).not.toHaveBeenCalled();
    });

    it('code 节点吞掉 split_node', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para({ text: 'x', code: true })];

      editor.apply({
        type: 'split_node',
        path: [0, 0],
        position: 1,
        properties: {},
      });

      expect(originalApply).not.toHaveBeenCalled();
    });

    it('普通节点的 split_node 透传', () => {
      const base = createEditor();
      const originalApply = vi.fn();
      base.apply = originalApply;
      const editor = withCodeTagPlugin(base);
      editor.children = [para({ text: 'hello' })];

      editor.apply({
        type: 'split_node',
        path: [0, 0],
        position: 3,
        properties: {},
      });

      expect(originalApply).toHaveBeenCalled();
    });
  });

  // ================================================================
  // deleteBackward
  // ================================================================

  describe('deleteBackward', () => {
    it('Editor.previous 抛错时不崩溃', () => {
      const editor = withCodeTagPlugin(createEditor());
      editor.children = [para({ text: 'x' })];
      editor.selection = {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      };

      const spy = vi
        .spyOn(Editor, 'previous')
        .mockImplementation(() => {
          throw new Error('fail');
        });

      expect(() => editor.deleteBackward('character')).not.toThrow();
      spy.mockRestore();
    });

    it('前一个是 tag 且为唯一子节点时 setNodes 转为普通文本', () => {
      const editor = withCodeTagPlugin(createEditor());
      editor.children = [para(tagNode('x')), para({ text: 'y' })];
      editor.selection = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      };

      const prev = tagNode('x');
      const prevPath: [number, number] = [0, 0];
      const prevSpy = vi
        .spyOn(Editor, 'previous')
        .mockReturnValue([prev, prevPath] as any);
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      editor.deleteBackward('character');

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({
          tag: false,
          code: false,
          text: ' ',
          triggerText: undefined,
        }),
        expect.objectContaining({ at: [0, 0] }),
      );
      prevSpy.mockRestore();
      setNodesSpy.mockRestore();
    });

    it('前一个是 tag 且非首个子节点时 removeNodes', () => {
      const editor = withCodeTagPlugin(createEditor());
      editor.children = [
        para({ text: 'a' }, tagNode('b')),
        para({ text: 'c' }),
      ];
      editor.selection = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      };

      const prev = tagNode('b');
      const prevPath: [number, number] = [0, 1];
      vi.spyOn(Editor, 'previous').mockReturnValue([
        prev,
        prevPath,
      ] as any);
      vi.spyOn(Node, 'get').mockImplementation((_e, path) => {
        if (Path.equals(path, [1, 0])) return { text: 'c' } as any;
        if (Path.equals(path, [0]))
          return { children: [{ text: 'a' }, prev] } as any;
        return { text: '' } as any;
      });
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');

      editor.deleteBackward('character');

      expect(removeSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ at: [0, 1] }),
      );
      vi.restoreAllMocks();
    });

    it('当前节点是空 tag 且 offset=0 时清除 tag 属性', () => {
      const editor = withCodeTagPlugin(createEditor());
      editor.children = [para(tagNode(' ', { triggerText: '$' }))];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      vi.spyOn(Editor, 'previous').mockReturnValue(undefined as any);

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

      editor.deleteBackward('character');

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        expect.objectContaining({ tag: false, code: false }),
        expect.objectContaining({ at: [0, 0] }),
      );
      vi.restoreAllMocks();
    });

    it('前一个是 tag + 当前有多字符 + offset>0 时正常 deleteBackward', () => {
      const base = createEditor();
      const originalDeleteBackward = vi.fn();
      base.deleteBackward = originalDeleteBackward;
      const editor = withCodeTagPlugin(base);
      editor.children = [para(tagNode('x')), para({ text: 'abc' })];
      editor.selection = {
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      };

      const prev = tagNode('x');
      vi.spyOn(Editor, 'previous').mockReturnValue([
        prev,
        [0, 0],
      ] as any);

      editor.deleteBackward('character');

      expect(originalDeleteBackward).toHaveBeenCalledWith('character');
      vi.restoreAllMocks();
    });

    it('非 tag 场景正常 deleteBackward', () => {
      const base = createEditor();
      const originalDeleteBackward = vi.fn();
      base.deleteBackward = originalDeleteBackward;
      const editor = withCodeTagPlugin(base);
      editor.children = [para({ text: 'hello' })];
      editor.selection = {
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      };

      vi.spyOn(Editor, 'previous').mockReturnValue([
        { text: 'hello' },
        [0, 0],
      ] as any);

      editor.deleteBackward('character');

      expect(originalDeleteBackward).toHaveBeenCalledWith('character');
      vi.restoreAllMocks();
    });
  });
});
