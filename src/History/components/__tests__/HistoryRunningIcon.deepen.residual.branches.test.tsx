/**
 * HistoryRunningIcon deepen：同名 keyframes 二次注入早退。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HistoryRunningIcon } from '../HistoryRunningIcon';

describe('HistoryRunningIcon deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('animated 关闭再开启时命中已注入 Set 分支', () => {
    const { rerender } = render(<HistoryRunningIcon animated={true} />);
    rerender(<HistoryRunningIcon animated={false} />);
    rerender(<HistoryRunningIcon animated={true} />);
    const styles = document.querySelectorAll(
      'style[data-history-running-icon]',
    );
    expect(styles.length).toBeGreaterThan(0);
  });
});
