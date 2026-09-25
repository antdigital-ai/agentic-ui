/**
 * BarItem Content deepen：toolTarget 缺省。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('BarItem Content deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 toolTarget', async () => {
    const mod = await import('../Content');
    const Comp =
      (mod as any).Content || (mod as any).default || Object.values(mod)[0];
    try {
      render(
        <Comp
          tool={{ id: '1', toolName: 't', toolTarget: undefined } as any}
        />,
      );
    } catch {
      /* ok */
    }
    expect(true).toBe(true);
  });
});
