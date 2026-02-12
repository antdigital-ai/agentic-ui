import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { BaseEditor, createEditor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as elements from '../../elements';
import { MatchKey } from '../match';

// Mock TextMatchNodes：第一个节点 matchKey '**' 且 checkAllow 为 false，用于覆盖 continue 分支
vi.mock('../../elements', () => ({
  TextMatchNodes: [
    {
      matchKey: '**',
      reg: /\*\*([^*]+)\*\*/,
      run: vi.fn(() => true),
      checkAllow: vi.fn(() => false),
    },
    {
      matchKey: '*',
      reg: /\*([^*]+)\*/,
      run: vi.fn(() => false),
      checkAllow: vi.fn(() => false),
    },
    {
      matchKey: /^`$/,
      reg: /`([^`]+)`/,
      run: vi.fn(() => true),
      checkAllow: vi.fn(() => true),
    },
  ],
}));

describe('MatchKey', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  let editor: BaseEditor & ReactEditor & HistoryEditor;
  let matchKey: MatchKey;

  beforeEach(() => {
    editor = withHistory(withReact(createEditor())) as BaseEditor &
      ReactEditor &
      HistoryEditor;
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    matchKey = new MatchKey(editor);
  });

  describe('构造函数', () => {
    it('应该正确初始化 MatchKey 实例', () => {
      expect(matchKey).toBeInstanceOf(MatchKey);
    });
  });

  describe('run 方法', () => {
    it('应该在代码块中不执行匹配', () => {
      // 创建代码块
      Transforms.insertNodes(editor, {
        type: 'code',
        children: [{ text: 'test' }],
      });

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该在没有选择时返回', () => {
      editor.selection = null;

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该在非折叠选择时返回', () => {
      // 创建多行文本并选择
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该处理字符串匹配键', () => {
      // 插入文本并选择，创建匹配场景
      Transforms.insertText(editor, 'test**');
      Transforms.select(editor, { path: [0, 0], offset: 6 });

      const mockEvent = {
        key: '*',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      // 在没有实际匹配的情况下，不应该调用 preventDefault
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该处理正则表达式匹配键', () => {
      // 插入文本并选择，创建匹配场景
      Transforms.insertText(editor, 'test`');
      Transforms.select(editor, { path: [0, 0], offset: 5 });

      const mockEvent = {
        key: '`',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      // 在没有实际匹配的情况下，不应该调用 preventDefault
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该在 checkAllow 返回 false 时跳过匹配', () => {
      Transforms.insertText(editor, '**a**');
      Transforms.select(editor, { path: [0, 0], offset: 6 });

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect((elements as any).TextMatchNodes[0].checkAllow).toHaveBeenCalled();
    });

    it('应在 checkAllow 返回 true 且正则匹配时调用第一个节点的 run', () => {
      const nodes = (elements as any).TextMatchNodes;
      vi.mocked(nodes[0].checkAllow).mockReturnValueOnce(true);
      Transforms.insertText(editor, '**a**');
      Transforms.select(editor, { path: [0, 0], offset: 5 });
      const mockEvent = { key: '**', preventDefault: vi.fn() } as any;
      matchKey.run(mockEvent);
      expect(nodes[0].checkAllow).toHaveBeenCalled();
      expect(nodes[0].run).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应在 key 为 * 时调用第二个节点的 checkAllow 与 run', () => {
      const nodes = (elements as any).TextMatchNodes;
      vi.mocked(nodes[1].checkAllow).mockReturnValueOnce(true);
      Transforms.insertText(editor, '*a*');
      Transforms.select(editor, { path: [0, 0], offset: 3 });
      const mockEvent = { key: '*', preventDefault: vi.fn() } as any;
      matchKey.run(mockEvent);
      expect(nodes[1].checkAllow).toHaveBeenCalled();
      expect(nodes[1].run).toHaveBeenCalled();
    });

    it('应在 key 为 ` 且正则匹配时调用第三个节点的 checkAllow 与 run', () => {
      const nodes = (elements as any).TextMatchNodes;
      Transforms.insertText(editor, '`x`');
      Transforms.select(editor, { path: [0, 0], offset: 3 });
      const mockEvent = { key: '`', preventDefault: vi.fn() } as any;
      matchKey.run(mockEvent);
      expect(nodes[2].checkAllow).toHaveBeenCalled();
      expect(nodes[2].run).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('应该处理复杂的文本匹配场景', () => {
      // 插入文本并选择，创建匹配场景
      Transforms.insertText(editor, 'This is **bold** text');
      Transforms.select(editor, { path: [0, 0], offset: 8 });

      const mockEvent = {
        key: '*',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      // 在没有实际匹配的情况下，不应该调用 preventDefault
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该在没有匹配时不做任何操作', () => {
      Transforms.insertText(editor, 'test');
      Transforms.select(editor, { path: [0, 0], offset: 4 });

      const mockEvent = {
        key: 'xyz',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    it('应该处理空编辑器', () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该处理只有空格的文本', () => {
      Transforms.insertText(editor, '   ');
      Transforms.select(editor, { path: [0, 0], offset: 3 });

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('应该处理特殊字符', () => {
      Transforms.insertText(editor, 'test@#$%');
      Transforms.select(editor, { path: [0, 0], offset: 8 });

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      matchKey.run(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量文本', () => {
      const longText = 'a'.repeat(1000);
      Transforms.insertText(editor, longText);
      Transforms.select(editor, { path: [0, 0], offset: 500 });

      const mockEvent = {
        key: '**',
        preventDefault: vi.fn(),
      } as any;

      const startTime = performance.now();
      matchKey.run(mockEvent);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
