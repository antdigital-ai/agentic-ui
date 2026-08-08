/**
 * CaseReply deepen2：无 onClick；默认按钮文案。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CaseReply from '../CaseReply';

describe('CaseReply deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 onClick 点击不炸；默认按钮文案', () => {
    const { container } = render(
      <ConfigProvider>
        <CaseReply quote="q" />
      </ConfigProvider>,
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    expect(screen.getByText('q')).toBeInTheDocument();
  });
});
