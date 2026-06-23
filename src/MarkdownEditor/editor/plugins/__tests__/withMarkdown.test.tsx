import { Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestMarkdownEditor } from '../../__tests__/helpers/createTestMarkdownEditor';

describe('withMarkdown plugin - tag operations', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestMarkdownEditor([]);
  });

  describe('tag deletion behavior', () => {
    beforeEach(() => {
      // 设置初始内容
      editor.children = [
        {
          type: 'paragraph',
          children: [
            { text: 'before ' },
            { text: 'code', tag: true, code: true },
            { text: ' after' },
          ],
        },
      ];
    });

    it('should delete character by character when cursor is inside tag', () => {
      // 将光标放在 tag 内部的 "co|de" 位置
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 2 },
        focus: { path: [0, 1], offset: 2 },
      });

      // 执行删除
      editor.deleteBackward('character');

      // 验证结果：应该只删除一个字符
      expect(editor.children[0].children[1]).toEqual({
        text: 'cde',
        tag: true,
        code: true,
      });
    });

    it('should delete entire tag when cursor is after tag', () => {
      // 将光标放在 tag 后面的空格位置
      Transforms.select(editor, {
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      });

      // 执行删除
      editor.deleteBackward('character');

      // 验证结果：tag 应该被完全删除
      expect(editor.children[0].children).toHaveLength(1);
      expect(editor.children[0].children[0]).toEqual({ text: 'before  after' });
    });

    it('should handle selection deletion within tag', async () => {
      // 选中 tag 中的部分文本 "co|de"
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 2 },
        focus: { path: [0, 1], offset: 2 },
      });

      // 执行删除
      editor.deleteBackward('character');

      // 验证结果：应该只删除选中的部分
      expect(editor.children[0].children[1]).toEqual({
        text: 'cde',
        tag: true,
        code: true,
      });
    });

    it('should handle empty tag deletion', () => {
      // 设置一个空的 tag
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: '', tag: true, code: true }],
        },
      ];

      // 将光标放在空 tag 内
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除
      editor.deleteBackward('character');

      // 验证结果：tag 应该被转换为普通文本
      expect(editor.children[0].children[0]).toEqual({
        text: '',
        tag: false,
        code: false,
      });
    });

    it('should handle tag with trigger text deletion', () => {
      // 设置带有触发文本的 tag
      editor.children = [
        {
          type: 'paragraph',
          children: [
            {
              text: '$ code',
              tag: true,
              code: true,
              triggerText: '$',
            },
          ],
        },
      ];

      // 删除触发文本
      Transforms.delete(editor, {
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 2 },
        },
      });

      // 执行删除
      editor.deleteBackward('character');

      // 验证结果：tag 应该被转换为普通文本
      expect(editor.children[0].children[0]).toEqual({
        code: true,
        tag: true,
        text: 'code',
        triggerText: '$',
      });
    });
  });
});
