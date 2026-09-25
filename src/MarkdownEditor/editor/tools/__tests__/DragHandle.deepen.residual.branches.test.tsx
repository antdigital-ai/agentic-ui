/**
 * DragHandle deepen：mock store 下渲染。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../store', () => ({
  useEditorStore: () => ({
    readonly: false,
    store: { editor: { selection: null, children: [] } },
    markdownEditorRef: { current: null },
  }),
}));

import { DragHandle } from '../DragHandle';

describe('DragHandle deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无选区时渲染不抛', () => {
    expect(() => render(<DragHandle />)).not.toThrow();
  });

  it('自定义 style', () => {
    expect(() =>
      render(<DragHandle style={{ opacity: 0.5 }} />),
    ).not.toThrow();
  });
});
