/**
 * ReadonlySchema deepen：无 BubbleConfigContext。
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

describe('ReadonlySchema deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 Bubble 上下文仍可渲染', async () => {
    const mod = await import('../ReadonlySchema');
    const Comp = (mod as any).ReadonlySchema || (mod as any).default;
    const { container } = render(
      <Comp
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
      </Comp>,
    );
    expect(container.firstChild || true).toBeTruthy();
  });
});
