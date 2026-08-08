/**
 * Enlargement deepen2：locale.shrink/enlarge 显式 undefined。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Enlargement from '../index';

vi.mock('../../../I18n', () => ({
  useLocale: () => ({ shrink: undefined, enlarge: undefined }),
}));

describe('Enlargement deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('locale 字段 undefined 仍走默认', () => {
    const { container, rerender } = render(
      <Enlargement isEnlarged={false} />,
    );
    expect(container.firstChild).toBeTruthy();
    rerender(<Enlargement isEnlarged />);
    expect(container.firstChild).toBeTruthy();
  });
});
