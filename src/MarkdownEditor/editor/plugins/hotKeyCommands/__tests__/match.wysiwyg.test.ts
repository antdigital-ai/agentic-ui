import '@testing-library/jest-dom';
import React from 'react';
import { BaseEditor, createEditor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { ReactEditor, withReact } from 'slate-react';
import { describe, expect, it, vi } from 'vitest';
import { MatchKey } from '../match';
import { withMarkdown } from '../../withMarkdown';

type TestEditor = BaseEditor & ReactEditor & HistoryEditor;

const createTestEditor = (): TestEditor =>
  withMarkdown(withHistory(withReact(createEditor()))) as TestEditor;

describe('MatchKey 即时转换（WYSIWYG，#59）', () => {
  it('非首段输入 "# " 应即时转为标题', () => {
    const editor = createTestEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'first paragraph' }] },
      { type: 'paragraph', children: [{ text: '#' }] },
    ] as any;
    // 光标位于第二段 "#" 之后
    Transforms.select(editor, { path: [1, 0], offset: 1 });

    const matchKey = new MatchKey(
      { current: editor } as React.MutableRefObject<TestEditor>,
    );
    const event = {
      key: ' ',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    const handled = matchKey.run(event);

    expect(handled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect((editor.children[1] as any).type).toBe('head');
    expect((editor.children[1] as any).level).toBe(1);
  });

  it('非首段输入 "- " 在 matchInputToNode 默认关闭时也应转为列表', () => {
    const editor = createTestEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'intro' }] },
      { type: 'paragraph', children: [{ text: '-' }] },
    ] as any;
    Transforms.select(editor, { path: [1, 0], offset: 1 });

    const matchKey = new MatchKey(
      { current: editor } as React.MutableRefObject<TestEditor>,
    );
    const event = {
      key: ' ',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    const handled = matchKey.run(event);

    expect(handled).toBe(true);
    expect((editor.children[1] as any).type).toBe('bulleted-list');
  });

  it('首段输入 "- " 在 matchInputToNode 关闭时保持纯文本（聊天输入框保护）', () => {
    const editor = createTestEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '-' }] }] as any;
    Transforms.select(editor, { path: [0, 0], offset: 1 });

    const matchKey = new MatchKey(
      { current: editor } as React.MutableRefObject<TestEditor>,
      // 模拟默认配置：matchInputToNode 未开启
      () => false,
    );
    const event = {
      key: ' ',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    const handled = matchKey.run(event);

    expect(handled).toBe(false);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });

  it('首段输入 "# " 标题转换不受 matchInputToNode 门控影响', () => {
    const editor = createTestEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '#' }] }] as any;
    Transforms.select(editor, { path: [0, 0], offset: 1 });

    const matchKey = new MatchKey(
      { current: editor } as React.MutableRefObject<TestEditor>,
      () => false,
    );
    const event = {
      key: ' ',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    const handled = matchKey.run(event);

    expect(handled).toBe(true);
    expect((editor.children[0] as any).type).toBe('head');
  });
});
