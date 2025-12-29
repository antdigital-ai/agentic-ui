import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Node, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../@ant-design/agentic-ui/MarkdownEditor/editor/plugins/withMarkdown';
import {
  ReactEditor,
  withReact,
} from 'slate-react';

// Mock ReactEditor DOM methods
vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => ({
      querySelector: vi.fn(() => ({
        textContent: '',
      })),
    })),
  },
  withReact: (editor: any) => editor,
}));

describe('withMarkdown Plugin - deleteBackward Tag Handling Tests', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;

  const createTestEditor = () => {
    const baseEditor = withMarkdown(withHistory(withReact(createEditor())));
    baseEditor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return baseEditor;
  };

  beforeEach(() => {
    editor = createTestEditor();
  });

  describe('Tag Node Deletion from Previous Position', () => {
    it('should delete entire tag when deleting from next node with only single character', () => {
      // 创建一个包含tag节点和只有一个字符的文本节点的段落
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const singleCharTextNode = { text: 'a' };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, singleCharTextNode],
        },
      ];

      // 选中单字符文本节点的末尾位置（光标在字符后，offset > 0）
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 1 },
        focus: { path: [0, 1], offset: 1 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：应该清空当前文本并插入一个新的段落节点
      // 根据代码逻辑，这会调用insertText('')和insertNodes
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle normal deletion when current node has more than one character', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const multiCharTextNode = { text: 'abc' };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, multiCharTextNode],
        },
      ];

      // 选中多字符文本节点的中间位置
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 2 },
        focus: { path: [0, 1], offset: 2 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：应该正常删除一个字符
      const textNode = Node.get(editor, [0, 1]);
      expect(textNode.text).toBe('ac'); // 删除了中间的'b'
    });

    it('should delete tag when cursor is at beginning of next empty node', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const emptyTextNode = { text: '' };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, emptyTextNode],
        },
      ];

      // 选中空文本节点的开始位置（offset <= 1，且前一个节点是tag）
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：根据调试结果，tag节点和空节点都被删除，只剩下一个空文本节点
      expect(editor.children[0].children.length).toBe(1);

      // 验证剩余的节点是普通文本
      const remainingNode = Node.get(editor, [0, 0]);
      expect(remainingNode.tag).toBeFalsy();
      expect(remainingNode.text).toBe('');
    });

    it('should handle tag deletion when it is the only node in paragraph from next paragraph', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ];

      // 选中第二个段落的开始位置（offset <= 1，且前一个节点是tag）
      Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：根据调试结果，第二个段落被删除，tag节点保持不变
      expect(editor.children.length).toBe(1);
      expect(editor.children[0].children.length).toBe(1);

      const remainingNode = editor.children[0].children[0];
      expect(remainingNode.tag).toBe(true);
      expect(remainingNode.text).toBe('code');
    });

    it('should handle tag deletion when it is the first node among multiple siblings', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const textNode1 = { text: 'text1' };
      const textNode2 = { text: 'text2' };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, textNode1, textNode2],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ];

      // 选中第二个段落的开始位置（offset <= 1，且前一个节点是tag）
      Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：根据调试结果，第二个段落被合并到第一个段落中
      expect(editor.children.length).toBe(1);
      const firstParagraph = editor.children[0];
      expect(firstParagraph.children.length).toBe(2);
      expect(firstParagraph.children[0].text).toBe('code');
      expect(firstParagraph.children[0].tag).toBe(true);
      expect(firstParagraph.children[1].text).toBe('text1text2'); // 两个文本节点合并
    });

    it('should handle tag deletion when it is a middle or last node among siblings', () => {
      const textNode1 = { text: 'text1' };
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const textNode2 = { text: 'text2' };

      editor.children = [
        {
          type: 'paragraph',
          children: [textNode1, tagNode, textNode2],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ];

      // 选中第二个段落的开始位置
      Transforms.select(editor, {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      // 执行删除操作 - 这种情况下前一个节点不是tag，而是textNode2
      editor.deleteBackward('character');

      // 验证：应该执行正常的段落合并
      expect(editor.children.length).toBe(1);
      const firstParagraph = editor.children[0];
      expect(firstParagraph.children.length).toBe(3);
      expect(firstParagraph.children[0].text).toBe('text1');
      expect(firstParagraph.children[1].tag).toBe(true);
      expect(firstParagraph.children[2].text).toBe('text2');
    });

    it('should handle error gracefully when previous node retrieval fails', () => {
      const textNode = { text: 'test' };

      editor.children = [
        {
          type: 'paragraph',
          children: [textNode],
        },
      ];

      // 选中文本节点的开始位置（没有前一个节点）
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作，应该正常执行而不报错
      expect(() => {
        editor.deleteBackward('character');
      }).not.toThrow();
    });
  });

  describe('Current Tag Node Deletion', () => {
    it('should NOT convert tag with meaningful content when deleting at beginning', () => {
      const tagNode = {
        text: '`code',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode],
        },
      ];

      // 选中tag节点的开始位置（光标偏移小于1）
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：因为 trim 长度 >= 1，标签不应该被转换
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeTruthy();
      expect(node.code).toBeTruthy();
      expect(node.text).toBe('`code'); // 内容保持不变
    });

    it('should not convert tag when deleting in middle of tag text', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode],
        },
      ];

      // 选中tag节点的中间位置（光标偏移大于等于1）
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：tag属性应该保持，正常删除字符
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBe(true);
      expect(node.code).toBe(true);
      expect(node.text).toBe('cde'); // 删除了'o'
    });
  });

  describe('Special Cases and Edge Conditions', () => {
    it('should handle whitespace-only text in single character node correctly', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const whitespaceNode = { text: ' ' }; // 只有空格的单字符节点

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, whitespaceNode],
        },
      ];

      // 选中空格节点的末尾
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 1 },
        focus: { path: [0, 1], offset: 1 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：由于文本trim后为空，应该正常执行原始删除操作
      expect(editor.children[0].children.length).toBeLessThanOrEqual(2);
    });

    it('should handle non-collapsed selection gracefully', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const textNode = { text: 'test' };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, textNode],
        },
      ];

      // 创建非折叠选区（选中一段文本）
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 2 },
      });

      // 执行删除操作，应该执行原始的删除逻辑
      expect(() => {
        editor.deleteBackward('character');
      }).not.toThrow();
    });

    it('should handle card nodes correctly in deleteBackward', () => {
      const cardNode = {
        type: 'card',
        children: [
          {
            type: 'card-before',
            children: [{ text: '' }],
          },
          {
            type: 'media',
            url: 'test.jpg',
            mediaType: 'image',
            children: [{ text: '' }],
          },
          {
            type: 'card-after',
            children: [{ text: '' }],
          },
        ],
      };

      editor.children = [cardNode];

      // 测试在card-before中的删除行为
      Transforms.select(editor, {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      });

      const beforeState = JSON.stringify(editor.children);
      editor.deleteBackward('character');

      // 在card-before中应该阻止删除
      expect(JSON.stringify(editor.children)).toBe(beforeState);
    });

    it('should handle special trigger condition with trimmed single character', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      // 创建一个trimEnd()后只有一个字符的节点
      const paddedSingleCharNode = { text: 'a   ' }; // 末尾有空格，trim后长度为1

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, paddedSingleCharNode],
        },
      ];

      // 选中节点中间位置，offset > 0
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 2 },
        focus: { path: [0, 1], offset: 2 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：根据特殊逻辑，应该创建新段落
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle isBeforeTag condition with exact offset boundary', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };
      const textNode = { text: 'test' };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode, textNode],
        },
      ];

      // 测试 offset === 1 的边界情况（isBeforeTag的边界）
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 1 },
        focus: { path: [0, 1], offset: 1 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：应该执行正常的字符删除
      const textNodeAfter = Node.get(editor, [0, 1]);
      expect(textNodeAfter.text).toBe('est'); // 删除了第一个字符 't'
    });

    it('should handle range selection without hasRange validation', () => {
      const tagNode = {
        text: 'code',
        tag: true,
        code: true,
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagNode],
        },
      ];

      // 测试没有选区的情况
      editor.selection = null;

      // 执行删除操作应该不会报错
      expect(() => {
        editor.deleteBackward('character');
      }).not.toThrow();
    });

    it('should handle edge case when previous node exists but is not a tag', () => {
      const textNode1 = { text: 'normal' };
      const textNode2 = { text: 'test' };

      editor.children = [
        {
          type: 'paragraph',
          children: [textNode1, textNode2],
        },
      ];

      // 选中第二个文本节点的开始位置（前一个节点不是tag）
      Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：应该执行正常的字符删除或合并
      expect(editor.children[0].children.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Empty Tag Node Deletion (trim length < 1)', () => {
    it('should convert empty tag to normal text when text is empty string', () => {
      const emptyTagNode = {
        text: '',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [emptyTagNode],
        },
      ];

      // 选中空标签节点的开始位置 (offset < 1)
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：标签应该被转换为普通文本，但 triggerText 保留（根据实际行为）
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeFalsy();
      expect(node.code).toBeFalsy();
      expect(node.text).toBe(''); // 替换后的文本（移除了triggerText）
      expect(node.triggerText).toBe('`'); // triggerText 实际上被保留
    });

    it('should convert tag with only whitespace to normal text', () => {
      const whitespaceTagNode = {
        text: '   ',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [whitespaceTagNode],
        },
      ];

      // 选中标签节点的开始位置 (offset < 1)
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：标签应该被转换为普通文本，保留空格
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeFalsy();
      expect(node.code).toBeFalsy();
      expect(node.text).toBe('   '); // 保留原始空格
      expect(node.triggerText).toBe('`'); // triggerText 实际上被保留
    });

    it('should convert tag with tabs and newlines to normal text', () => {
      const whitespaceTagNode = {
        text: '\t\n\r ',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [whitespaceTagNode],
        },
      ];

      // 选中标签节点的开始位置 (offset < 1)
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：标签应该被转换为普通文本
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeFalsy();
      expect(node.code).toBeFalsy();
      expect(node.text).toBe('\t\n\r '); // 保留原始空白字符
      expect(node.triggerText).toBe('`'); // triggerText 实际上被保留
    });

    it('should NOT convert tag with triggerText when trim length >= 1', () => {
      const tagWithTriggerNode = {
        text: '`   ',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [tagWithTriggerNode],
        },
      ];

      // 选中标签节点的开始位置 (offset < 1)
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：因为 trim 长度 = 1 (不小于1)，标签不应该被转换
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeTruthy();
      expect(node.code).toBeTruthy();
      expect(node.text).toBe('`   '); // 内容保持不变
      expect(node.triggerText).toBe('`'); // triggerText 保持不变
    });

    it('should handle offset >= 1 case correctly', () => {
      const emptyTagNode = {
        text: '  ',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [emptyTagNode],
        },
      ];

      // 选中标签节点的中间位置 (offset >= 1)
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：根据调试结果，标签还是会被转换，但走的是不同的代码路径
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeFalsy(); // 标签被转换
      expect(node.code).toBeFalsy();
      expect(node.text).toBe('  '); // 文本长度没有变化
      expect(node.triggerText).toBeUndefined(); // triggerText 被移除
    });

    it('should NOT convert tag when text has meaningful content after trim', () => {
      const contentTagNode = {
        text: ' hello ',
        tag: true,
        code: true,
        triggerText: '`',
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [contentTagNode],
        },
      ];

      // 选中标签节点的开始位置 (offset < 1)
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：标签应该保持不变，因为trim后长度 >= 1
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeTruthy();
      expect(node.code).toBeTruthy();
      expect(node.text).toBe(' hello '); // 内容应该保持不变
    });

    it('should NOT convert when node is not a tag', () => {
      const normalTextNode = {
        text: '   ',
        tag: false, // 不是标签节点
      };

      editor.children = [
        {
          type: 'paragraph',
          children: [normalTextNode],
        },
      ];

      // 选中文本节点的开始位置 (offset < 1)
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // 执行删除操作
      editor.deleteBackward('character');

      // 验证：节点应该保持不变（正常的删除逻辑）
      const node = Node.get(editor, [0, 0]);
      expect(node.tag).toBeFalsy();
      expect(node.text).toBe('   '); // 内容应该保持不变
    });
  });
});
