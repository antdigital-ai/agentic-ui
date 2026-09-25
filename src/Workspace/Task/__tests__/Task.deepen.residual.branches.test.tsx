/**
 * Workspace Task deepen：status success switch 臂。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskList } from '../index';

describe('Workspace Task deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('status=success 渲染', () => {
    const { container } = render(
      <ConfigProvider>
        <TaskList
          data={{
            items: [
              {
                key: '1',
                title: 't',
                status: 'success',
              },
            ],
          }}
        />
      </ConfigProvider>,
    );
    expect(container.textContent).toContain('t');
  });
});
