import { createEditor, Editor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import { composerChipToText } from '../../elements/ComposerChip/types';
import {
  handleLongTextPasteFold,
  insertComposerChip,
} from '../withComposerChips';
import { withMarkdown } from '../withMarkdown';

const makeEditor = (initialValue?: Node[]) => {
  const editor = withMarkdown(withHistory(withReact(createEditor())));
  editor.children =
    initialValue ?? ([{ type: 'paragraph', children: [{ text: '' }] }] as any);
  editor.selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  };
  return editor;
};

describe('withComposerChips 插件', () => {
  describe('inline / void 注册', () => {
    const editor = makeEditor();

    it('composer-chip 是 inline', () => {
      expect(
        editor.isInline({
          type: 'composer-chip',
          chip: null,
          children: [{ text: '' }],
        } as any),
      ).toBe(true);
    });

    it('composer-chip 是 void', () => {
      expect(
        editor.isVoid({
          type: 'composer-chip',
          chip: null,
          children: [{ text: '' }],
        } as any),
      ).toBe(true);
    });

    it('不破坏既有节点判定（paragraph 非 inline 非 void）', () => {
      expect(editor.isInline({ type: 'paragraph', children: [] } as any)).toBe(
        false,
      );
      expect(editor.isVoid({ type: 'paragraph', children: [] } as any)).toBe(
        false,
      );
    });
  });

  describe('insertComposerChip', () => {
    it('在光标处插入 chip 并追加分隔空格', () => {
      const editor = makeEditor();
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const ok = insertComposerChip(editor, {
        kind: 'file',
        id: 'f1',
        path: 'src/a.ts',
        name: 'a.ts',
      });
      expect(ok).toBe(true);
      // chip 节点 + 尾随空格都在文档里
      const paragraph = editor.children[0] as any;
      const chipNode = paragraph.children.find(
        (c: any) => c.type === 'composer-chip',
      );
      expect(chipNode).toBeTruthy();
      expect(chipNode.chip.path).toBe('src/a.ts');
      expect(composerChipToText(chipNode.chip)).toBe('@src/a.ts');
      // chip 之后有分隔空格
      const chipIndex = paragraph.children.indexOf(chipNode);
      expect(paragraph.children[chipIndex + 1]).toEqual({ text: ' ' });
    });

    it('选区内容被替换', () => {
      const editor = makeEditor([
        { type: 'paragraph', children: [{ text: 'old' }] },
      ] as any);
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      insertComposerChip(editor, {
        kind: 'slash',
        version: 1,
        id: 's1',
        name: 'plan',
        section: 'default',
        extensionId: 'x',
      });
      // void chip 不参与 Editor.string，直接断言节点结构
      const paragraph = editor.children[0] as any;
      const chipNode = paragraph.children.find(
        (c: any) => c.type === 'composer-chip',
      );
      expect(chipNode.chip.name).toBe('plan');
      expect(Editor.string(editor, [0])).not.toContain('old');
    });
  });

  describe('deleteBackward 整体删除 chip', () => {
    it('光标在 chip 后文本开头时 Backspace 删除整个 chip', () => {
      const editor = makeEditor([
        {
          type: 'paragraph',
          children: [
            {
              type: 'composer-chip',
              chip: { kind: 'file', id: 'f1', path: 'a.ts', name: 'a.ts' },
              children: [{ text: '' }],
            },
            { text: 'tail' },
          ],
        },
      ] as any);
      editor.selection = {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      };
      editor.deleteBackward('character');
      const paragraph = editor.children[0] as any;
      expect(
        paragraph.children.some((c: any) => c.type === 'composer-chip'),
      ).toBe(false);
      expect(Editor.string(editor, [0])).toBe('tail');
    });
  });

  describe('handleLongTextPasteFold', () => {
    it('超阈值文本折叠为 long-text chip', () => {
      const editor = makeEditor();
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      const longText = Array.from({ length: 20 }, (_, i) => `line-${i}`).join(
        '\n',
      );
      const handled = handleLongTextPasteFold(editor, longText);
      expect(handled).toBe(true);
      const paragraph = editor.children[0] as any;
      const chip = paragraph.children.find(
        (c: any) => c.type === 'composer-chip',
      );
      expect(chip?.chip.kind).toBe('long-text');
      expect(chip?.chip.text).toBe(longText);
      expect(chip?.chip.lineCount).toBe(20);
    });

    it('短文本不折叠（返回 false）', () => {
      const editor = makeEditor();
      const handled = handleLongTextPasteFold(editor, 'short');
      expect(handled).toBe(false);
    });
  });
});
