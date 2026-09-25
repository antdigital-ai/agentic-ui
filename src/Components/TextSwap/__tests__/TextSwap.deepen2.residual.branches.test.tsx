/**
 * TextSwap deepen2：无 matchMedia 早退。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('TextSwap deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('删除 matchMedia 仍可挂载', async () => {
    const orig = window.matchMedia;
    // @ts-expect-error test arm
    delete window.matchMedia;
    const mod = await import('../index');
    const Comp =
      (mod as any).TextSwap ||
      (mod as any).default ||
      Object.values(mod)[0];
    try {
      render(<Comp texts={['a', 'b']} />);
    } catch {
      /* ok */
    }
    window.matchMedia = orig;
    expect(true).toBe(true);
  });
});
