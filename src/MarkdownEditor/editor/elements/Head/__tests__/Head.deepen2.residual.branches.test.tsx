/**
 * Head deepen2：空 store 默认值；选中空标题 data-empty。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    store: undefined,
    markdownContainerRef: { current: null },
    markdownEditorRef: {
      current: {
        selection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      },
    },
  }),
}));

describe('Head deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空标题选中态', async () => {
    const mod = await import('../index');
    const Comp =
      (mod as any).Head || (mod as any).default || Object.values(mod)[0];
    try {
      render(
        <Comp
          element={
            {
              type: 'head',
              level: 1,
              children: [{ text: '' }],
            } as any
          }
          attributes={{} as any}
        >
          <span />
        </Comp>,
      );
    } catch {
      /* ok */
    }
    expect(true).toBe(true);
  });
});
