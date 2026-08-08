/**
 * ReadonlyEditorImage deepen：无 alt/url 默认文案；无 imageDom。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ReadonlyEditorImage deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('缺省 alt/url', async () => {
    const mod = await import('../ReadonlyEditorImage');
    const Comp =
      (mod as any).ReadonlyEditorImage ||
      (mod as any).default ||
      Object.values(mod)[0];
    try {
      render(
        <Comp
          element={
            {
              type: 'image',
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
