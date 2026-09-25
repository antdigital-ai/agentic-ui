/**
 * ButtonTabGroup deepen：items 缺省 → EMPTY_ITEMS default-arg。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ButtonTabGroup from '../ButtonTabGroup';

describe('ButtonTabGroup deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('省略 items：默认空列表可渲染', () => {
    const { container } = render(
      <ConfigProvider>
        <ButtonTabGroup />
      </ConfigProvider>,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
