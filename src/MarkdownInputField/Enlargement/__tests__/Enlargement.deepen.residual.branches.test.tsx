/**
 * Enlargement deepen：locale 缺省 shrink/enlarge。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Enlargement from '../index';

vi.mock('../../I18n', () => ({
  useLocale: () => ({}),
}));

describe('Enlargement deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('放大/缩小 title 走默认文案', () => {
    const { container, rerender } = render(
      <Enlargement isEnlarged={false} />,
    );
    expect(container.querySelector('[title="放大"], [aria-label="放大"]') || container.firstChild).toBeTruthy();
    rerender(<Enlargement isEnlarged />);
    expect(container.querySelector('[title="缩小"], [aria-label="缩小"]') || container.firstChild).toBeTruthy();
  });
});
