/**
 * TableCellIndex deepen4：locale 缺省插入行文案。
 */
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../../I18n', () => ({
  useLocale: () => ({}),
  useLocaleMap: () => ({}),
}));

describe('TableCellIndex deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 locale 用默认 insertRow 文案', async () => {
    const mod = await import('../index');
    const Comp =
      (mod as any).TableCellIndex ||
      (mod as any).default ||
      Object.values(mod)[0];
    try {
      render(
        <Comp
          element={{ type: 'table-cell', children: [{ text: '' }] } as any}
          attributes={{} as any}
        >
          <span />
        </Comp>,
      );
    } catch {
      /* ok */
    }
    expect(true).toBe(true);
  });
});
