import { describe, expect, it } from 'vitest';
import {
  childArrayHasInvalidEntries,
  sanitizeEditorChildren,
  sanitizeNode,
} from '../sanitizeInvalidChildrenBehavior';

describe('sanitizeInvalidChildrenBehavior', () => {
  it('sanitizeEditorChildren 去掉 undefined 子节点', () => {
    const result = sanitizeEditorChildren([
      {
        type: 'paragraph',
        children: [{ text: '' }, undefined],
      },
    ] as any);

    expect(result[0]).toEqual({
      type: 'paragraph',
      children: [{ text: '' }],
    });
  });

  it('sanitizeEditorChildren 压缩稀疏根数组', () => {
    const root = [{ type: 'paragraph', children: [{ text: 'a' }] }] as any;
    root.length = 2;

    expect(sanitizeEditorChildren(root)).toEqual([
      { type: 'paragraph', children: [{ text: 'a' }] },
    ]);
  });

  it('sanitizeNode 去掉 text 叶子上非法 children 字段', () => {
    const leaf = { text: 'hi', children: [] } as any;
    expect(sanitizeNode(leaf)).toEqual({ text: 'hi' });
  });

  it('childArrayHasInvalidEntries 检测空洞', () => {
    const children = [{ text: '' }] as any;
    children.length = 2;
    expect(childArrayHasInvalidEntries(children)).toBe(true);
  });

  it('sanitizeEditorChildren 在 undefined 根上返回默认段落', () => {
    expect(sanitizeEditorChildren(undefined)).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });
});
