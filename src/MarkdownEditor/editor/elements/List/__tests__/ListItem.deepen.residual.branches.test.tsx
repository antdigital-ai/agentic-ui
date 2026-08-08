/**
 * ListItem deepen：mock store 下 task / ordered 渲染。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    editorProps: {},
    readonly: true,
    store: {},
  }),
}));

vi.mock('../../../../hooks/editor', () => ({
  useMEditor: () => [{}, vi.fn()],
}));

import { ListItem } from '../ListItem';

describe('ListItem deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('task checked 项渲染', () => {
    expect(() =>
      render(
        <ListItem
          attributes={{ 'data-slate-node': 'element', ref: null } as any}
          element={
            {
              type: 'list-item',
              checked: true,
              children: [{ text: 'done' }],
            } as any
          }
        >
          <span>done</span>
        </ListItem>,
      ),
    ).not.toThrow();
  });

  it('未勾选 list-item', () => {
    expect(() =>
      render(
        <ListItem
          attributes={{ 'data-slate-node': 'element', ref: null } as any}
          element={
            {
              type: 'list-item',
              checked: false,
              children: [{ text: 'todo' }],
            } as any
          }
        >
          <span>todo</span>
        </ListItem>,
      ),
    ).not.toThrow();
  });
});
