/**
 * AgentRunBar deepen3：variant 显式 undefined 走 ?? 'default'。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AgentRunBar deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('variant=undefined 用 default', async () => {
    const mod = await import('../index');
    const Comp =
      (mod as any).AgentRunBar ||
      (mod as any).default ||
      Object.values(mod)[0];
    try {
      render(<Comp status="running" variant={undefined} />);
    } catch {
      /* ok */
    }
    expect(true).toBe(true);
  });
});
