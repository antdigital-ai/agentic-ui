import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { ListsEditor } from '../ListsEditor';
import * as Registry from '../registry';

describe('lists/registry 分支覆盖', () => {
  it('istanbul one-miss: 未注册 schema 时 get 抛出', () => {
    const editor = createEditor();
    expect(Registry.has(editor)).toBe(false);
    expect(() => Registry.get(editor)).toThrow(/ListsSchema/);
  });

  it('ListsEditor schema 代理在未启用时抛出', () => {
    const editor = createEditor();
    expect(() => ListsEditor.createListNode(editor)).toThrow(/ListsSchema/);
  });
});
