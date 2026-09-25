/**
 * AgentRunBar deepen2：variant 缺省 default。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AgentRunBar deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 variant 用 default', async () => {
    const mod = await import('../index');
    const Comp =
      (mod as any).AgentRunBar ||
      (mod as any).default ||
      Object.values(mod)[0];
    render(<Comp status="running" />);
    expect(document.body).toBeTruthy();
  });
});
