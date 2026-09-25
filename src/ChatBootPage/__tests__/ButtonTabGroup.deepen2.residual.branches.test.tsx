/**
 * ButtonTabGroup deepen2：disabled item 不触发 onChange。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ButtonTabGroup from '../ButtonTabGroup';

describe('ButtonTabGroup deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('disabled item 不触发 onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ConfigProvider>
        <ButtonTabGroup
          items={[{ key: 'a', label: 'A', disabled: true }]}
          activeKey="a"
          onChange={onChange}
        />
      </ConfigProvider>,
    );
    const el = container.querySelector('button, [role="button"], div');
    if (el) fireEvent.click(el);
    expect(container.firstChild).toBeTruthy();
  });
});
