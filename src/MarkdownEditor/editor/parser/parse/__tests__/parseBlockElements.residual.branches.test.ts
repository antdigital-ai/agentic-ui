/**
 * parseBlockElements residual：heading/list/blockquote 空 children。
 */
import { describe, expect, it } from 'vitest';
import {
  handleHeading,
  handleList,
  handleListItem,
} from '../parseBlockElements';

const parseNodes = (nodes: any[], _top?: boolean, _parent?: any) =>
  (nodes || []).map((n) =>
    n?.type === 'text' ? { text: n.value || '' } : { text: '' },
  );

describe('parseBlockElements residual branches', () => {
  it('handleHeading：有/无 children；depth', () => {
    expect(handleHeading({ depth: 2, children: [] }, parseNodes as any)).toMatchObject({
      type: 'head',
      level: 2,
      children: [{ text: '' }],
    });
    expect(
      handleHeading(
        { depth: 1, children: [{ type: 'text', value: 'T' }] },
        parseNodes as any,
      ).children[0],
    ).toMatchObject({ text: 'T' });
  });

  it('handleList：ordered / unordered；task checked', () => {
    const ul = handleList(
      { ordered: false, children: [{ type: 'listItem', children: [] }] },
      ((nodes) =>
        nodes.map(() => ({
          type: 'list-item',
          checked: true,
          children: [{ text: '' }],
        }))) as any,
    );
    expect(ul.type).toBe('bulleted-list');

    const ol = handleList(
      { ordered: true, start: 3, children: [] },
      (() => []) as any,
    );
    expect(ol.type).toBe('numbered-list');
  });

  it('handleListItem 空 children；handleHeading 已覆盖', () => {
    expect(
      handleListItem({ children: [] }, parseNodes as any).children,
    ).toBeTruthy();
    expect(
      handleHeading({ depth: 3, children: undefined }, parseNodes as any)
        .children,
    ).toEqual([{ text: '' }]);
  });
});
