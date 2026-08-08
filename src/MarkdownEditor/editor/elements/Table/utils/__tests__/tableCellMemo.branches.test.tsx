/**
 * tableCellMemo：element / children 引用相等矩阵。
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import type { RenderElementProps } from 'slate-react';
import { isSameTableCellRenderProps } from '../tableCellMemo';

const stub = (
  element: object,
  children: React.ReactNode,
): RenderElementProps =>
  ({
    element,
    children,
    attributes: { 'data-slate-node': 'element', ref: null },
  }) as unknown as RenderElementProps;

describe('tableCellMemo branches', () => {
  const el = { type: 'table-cell', children: [{ text: '' }] };
  const kids = React.createElement('span', null, 'c');

  it('同一 element 与 children 返回 true', () => {
    expect(isSameTableCellRenderProps(stub(el, kids), stub(el, kids))).toBe(
      true,
    );
  });

  it('element 不同返回 false', () => {
    expect(
      isSameTableCellRenderProps(stub(el, kids), stub({ ...el }, kids)),
    ).toBe(false);
  });

  it('children 不同返回 false', () => {
    expect(
      isSameTableCellRenderProps(
        stub(el, kids),
        stub(el, React.createElement('span', null, 'd')),
      ),
    ).toBe(false);
  });

  it('两者都不同返回 false', () => {
    expect(
      isSameTableCellRenderProps(
        stub(el, kids),
        stub(
          { type: 'header-cell' },
          React.createElement('span', null, 'x'),
        ),
      ),
    ).toBe(false);
  });
});
