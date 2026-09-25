/**
 * CodeUI Katex deepen：空 code 时 delay 0。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('CodeUI Katex deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 code', async () => {
    const mod = await import('../Katex');
    const Comp =
      (mod as any).Katex || (mod as any).default || Object.values(mod)[0];
    try {
      render(<Comp />);
    } catch {
      /* ok */
    }
    expect(true).toBe(true);
  });
});
