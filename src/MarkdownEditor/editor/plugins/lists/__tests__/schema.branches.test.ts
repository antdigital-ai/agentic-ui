import { describe, expect, it } from 'vitest';
import { ListType } from '../types';
import {
  agenticListsSchema,
  getListType,
  isListType,
} from '../schema';

describe('lists/schema 分支覆盖', () => {
  it('isListType / getListType', () => {
    expect(isListType({ text: 'x' } as any)).toBe(false);
    expect(
      isListType({ type: ListType.UNORDERED, children: [] } as any),
    ).toBe(true);
    expect(isListType({ type: ListType.ORDERED, children: [] } as any)).toBe(
      true,
    );
    expect(isListType({ type: 'paragraph', children: [] } as any)).toBe(false);
    expect(getListType(true)).toBe(ListType.ORDERED);
    expect(getListType(false)).toBe(ListType.UNORDERED);
    expect(getListType()).toBe(ListType.UNORDERED);
  });

  it('agenticListsSchema 谓词与工厂', () => {
    const s = agenticListsSchema;
    expect(s.isConvertibleToListTextNode({ text: 'x' } as any)).toBe(false);
    expect(
      s.isConvertibleToListTextNode({
        type: 'paragraph',
        children: [{ text: '' }],
      } as any),
    ).toBe(true);
    expect(s.isDefaultTextNode({ type: 'head', children: [] } as any)).toBe(
      false,
    );
    expect(s.isListNode({ text: 'x' } as any)).toBe(false);
    expect(
      s.isListNode({ type: ListType.ORDERED, children: [] } as any, ListType.ORDERED),
    ).toBe(true);
    expect(
      s.isListNode(
        { type: ListType.UNORDERED, children: [] } as any,
        ListType.ORDERED,
      ),
    ).toBe(false);
    expect(
      s.isListNode(
        { type: ListType.UNORDERED, children: [] } as any,
        ListType.UNORDERED,
      ),
    ).toBe(true);
    expect(
      s.isListNode({ type: ListType.ORDERED, children: [] } as any),
    ).toBe(true);
    expect(s.isListItemNode({ type: 'list-item', children: [] } as any)).toBe(
      true,
    );
    expect(s.isListItemTextNode({ type: 'paragraph', children: [] } as any)).toBe(
      true,
    );
    expect(s.createDefaultTextNode({ id: '1' }).type).toBe('paragraph');
    expect(s.createListNode(ListType.ORDERED).type).toBe(ListType.ORDERED);
    expect(s.createListNode().type).toBe(ListType.UNORDERED);
    expect(s.createListItemNode({ id: 'x' }).type).toBe('list-item');
    expect(s.createListItemTextNode({ id: 't' }).type).toBe('paragraph');
  });
});
