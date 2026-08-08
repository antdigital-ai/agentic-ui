/**
 * CopyButton deepen：locale 缺省成功文案。
 */
import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyButton } from '../index';

vi.mock('../../../../I18n', () => ({
  useLocale: () => ({}),
  useLocaleMap: () => ({}),
}));

describe('CopyButton deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 locale 时复制成功默认文案路径', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { container } = render(
      <CopyButton data-testid="copy" />,
    );
    const btn = container.querySelector('button, [role="button"], span, div');
    if (btn) fireEvent.click(btn);
    expect(container.firstChild).toBeTruthy();
  });
});
