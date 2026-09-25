/**
 * ToolUseBar deepen：light 缺省 false default-arg。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolUseBar } from '../index';

describe('ToolUseBar deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('省略 light：默认 false 可渲染空 tools', () => {
    const { container } = render(
      <ConfigProvider>
        <ToolUseBar tools={[]} />
      </ConfigProvider>,
    );
    expect(container).toBeTruthy();
  });
});
