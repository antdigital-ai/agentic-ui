/**
 * ReadonlyList deepen：numbered-list → ol（cond-expr arm0）。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyList } from '../ReadonlyList';

describe('ReadonlyList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('numbered-list 渲染 ol', () => {
    const { container } = render(
      <ConfigProvider>
        <ReadonlyList
          element={
            {
              type: 'numbered-list',
              start: 2,
              children: [{ text: '' }],
            } as any
          }
          attributes={{ 'data-slate': '1' } as any}
        >
          <li>one</li>
        </ReadonlyList>
      </ConfigProvider>,
    );
    expect(container.querySelector('ol')).toBeTruthy();
  });
});
