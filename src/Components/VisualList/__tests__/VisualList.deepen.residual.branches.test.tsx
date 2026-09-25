/**
 * VisualList deepen：list mouseLeave / item mouseEnter 不抛。
 */
import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VisualList } from '../index';

describe('VisualList deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('挂载后触发 mouseLeave / item mouseEnter 不抛', () => {
    const { container } = render(
      <ConfigProvider>
        <VisualList
          data={[
            { id: '1', src: 'https://x/a.png' },
            { id: '2', src: 'https://x/b.png' },
          ]}
        />
      </ConfigProvider>,
    );
    const list = container.querySelector('ul');
    expect(list).toBeTruthy();
    fireEvent.mouseLeave(list!);
    const item = container.querySelector('[data-visual-list-item]');
    expect(item).toBeTruthy();
    fireEvent.mouseEnter(item!);
  });
});
