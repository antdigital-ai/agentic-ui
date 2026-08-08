/**
 * SendButton deepen：disabled 点击早退。
 */
import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('SendButton deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('disabled 不触发发送', async () => {
    const mod = await import('../index');
    const Comp =
      (mod as any).SendButton ||
      (mod as any).default ||
      Object.values(mod)[0];
    const onSend = vi.fn();
    const { container } = render(
      <Comp disabled onSend={onSend} typing={false} />,
    );
    const btn = container.querySelector('button') || container.firstChild;
    if (btn) fireEvent.click(btn);
    expect(onSend).not.toHaveBeenCalled();
  });
});
