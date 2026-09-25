/**
 * VisualList deepen2：卸载后 mouse handlers 早退不抛。
 */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VisualList } from '../index';

describe('VisualList deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('卸载后触发 leave/enter 不抛', () => {
    const { container, unmount } = render(
      <ConfigProvider>
        <VisualList data={[{ id: '1', src: 'https://x/a.png' }]} />
      </ConfigProvider>,
    );
    const list = container.querySelector('ul');
    const item = container.querySelector('[data-visual-list-item]');
    unmount();
    expect(() => {
      if (list) fireEvent.mouseLeave(list);
      if (item) fireEvent.mouseEnter(item);
    }).not.toThrow();
  });
});
