/**
 * ActionIconBox deepen：非 ReactElement child → applyIconStyle 早退。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionIconBox } from '../index';

describe('ActionIconBox deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('字符串 children + iconStyle：非元素直接返回', () => {
    render(
      <ConfigProvider>
        <ActionIconBox title="t" iconStyle={{ color: 'red' }}>
          plain-text-icon
        </ActionIconBox>
      </ConfigProvider>,
    );
    expect(screen.getByText('plain-text-icon')).toBeInTheDocument();
  });
});
