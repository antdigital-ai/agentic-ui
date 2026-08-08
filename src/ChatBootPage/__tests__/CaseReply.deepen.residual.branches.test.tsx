/**
 * CaseReply deepen：coverBackground / quoteIconColor 默认参。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CaseReply from '../CaseReply';

describe('CaseReply deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('省略背景色默认参仍渲染 quote', () => {
    render(
      <ConfigProvider>
        <CaseReply quote="hello-quote" />
      </ConfigProvider>,
    );
    expect(screen.getByText('hello-quote')).toBeInTheDocument();
  });
});
