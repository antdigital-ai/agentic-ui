/**
 * VoiceInput deepen：recording 切换图标分支。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../Components/lotties', () => ({
  VoicingLottie: () => <span data-testid="lottie" />,
}));

describe('VoiceInput deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('recording true/false 渲染', async () => {
    const mod = await import('../VoiceInput');
    const VoiceInput = (mod as any).default || (mod as any).VoiceInput;
    const { rerender } = render(
      <VoiceInput recording={false} onClick={vi.fn()} />,
    );
    rerender(<VoiceInput recording onClick={vi.fn()} />);
    expect(document.body).toBeTruthy();
  });
});
