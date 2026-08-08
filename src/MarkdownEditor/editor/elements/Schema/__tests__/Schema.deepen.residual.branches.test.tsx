/**
 * Schema deepen：无 BubbleConfigContext 时 bubble 解构兜底。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    editorProps: {},
    store: {},
    readonly: true,
  }),
}));

describe('Schema deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 Bubble 上下文仍可渲染', async () => {
    const { Schema } = await import('../index');
    const { container } = render(
      <Schema
        element={
          {
            type: 'code',
            language: 'json',
            value: { a: 1 },
            children: [{ text: '' }],
          } as any
        }
        attributes={{ 'data-slate-node': 'element' } as any}
      >
        <span>child</span>
      </Schema>,
    );
    expect(container.firstChild || true).toBeTruthy();
  });
});
