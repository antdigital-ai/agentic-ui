/**
 * AnswerAlert deepen：type 缺省 → getAriaRole undefined（arm0）。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerAlert } from '../index';

describe('AnswerAlert deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 type：无 alert/status role', () => {
    const { container } = render(
      <ConfigProvider>
        <AnswerAlert message="m" motion={false} />
      </ConfigProvider>,
    );
    const el = container.querySelector('[role]');
    expect(el).toBeNull();
  });
});
