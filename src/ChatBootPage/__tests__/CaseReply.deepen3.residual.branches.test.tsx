/**
 * CaseReply deepen3：onButtonClick 无 buttonText 走默认文案。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CaseReply from '../CaseReply';

describe('CaseReply deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('仅 onButtonClick 显示默认按钮文案', () => {
    render(
      <ConfigProvider>
        <CaseReply quote="q" title="t" onButtonClick={vi.fn()} />
      </ConfigProvider>,
    );
    expect(screen.getByText('q')).toBeInTheDocument();
    expect(document.body.textContent || '').toMatch(/回放|Replay|view/i);
  });
});
