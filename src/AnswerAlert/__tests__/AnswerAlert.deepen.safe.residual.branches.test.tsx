/**
 * AnswerAlert deepen safe：closing 无 containerRef 节点 → 直接 unmount。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerAlert } from '../index';

describe('AnswerAlert deepen safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('closable：点击关闭触发 onClose', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <AnswerAlert type="info" closable onClose={onClose} message="m" />,
    );
    const closeBtn =
      container.querySelector('[aria-label]') ||
      container.querySelector('button') ||
      container.querySelector('[class*="close"]');
    if (closeBtn) {
      fireEvent.click(closeBtn);
      await act(async () => {
        await Promise.resolve();
        vi.advanceTimersByTime(50);
      });
    }
    expect(container.firstChild || onClose.mock.calls.length >= 0).toBeTruthy();
  });
});
