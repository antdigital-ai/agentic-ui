/**
 * ButtonTabGroup deepen3：直接点击 disabled ButtonTab。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ButtonTabGroup from '../ButtonTabGroup';

describe('ButtonTabGroup deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('disabled 项 onChange 不被调用', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <ConfigProvider>
        <ButtonTabGroup
          items={[
            { key: 'a', label: 'Alpha', disabled: true },
            { key: 'b', label: 'Beta' },
          ]}
          activeKey="b"
          onChange={onChange}
        />
      </ConfigProvider>,
    );
    fireEvent.click(getByText('Alpha'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
