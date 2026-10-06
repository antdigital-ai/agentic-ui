/**
 * ActionIconBox iconStyle 合并回归测试。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionIconBox } from '../index';

describe('ActionIconBox deepen safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('iconStyle 与子元素已有 style 合并', () => {
    const { container } = render(
      <ActionIconBox title="t" iconStyle={{ color: 'red' }}>
        <span style={{ display: 'block' }} />
      </ActionIconBox>,
    );

    expect(container.querySelector('span span')).toHaveStyle({
      color: 'red',
      display: 'block',
    });
  });
});
