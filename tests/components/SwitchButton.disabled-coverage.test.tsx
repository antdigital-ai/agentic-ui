/**
 * 覆盖 SwitchButton handleClick 中 disabled 时 return 分支
 * 通过 mock Button 使禁用时仍能触发 onClick，以执行 handleClick 内 if (disabled) return
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SwitchButton } from '../../src/Components/Button/SwitchButton';

vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>();
  return {
    ...antd,
    Button: (props: any) => {
      const { disabled, ...rest } = props;
      return (
        <button
          type="button"
          {...rest}
          data-disabled={disabled}
          onClick={(e: any) => props.onClick?.(e)}
        />
      );
    },
  };
});

describe('SwitchButton disabled 分支覆盖', () => {
  it('应在 disabled 时 handleClick 内直接 return，不调用 onChange/onClick', () => {
    const handleClick = vi.fn();
    const handleChange = vi.fn();

    render(
      <ConfigProvider>
        <SwitchButton disabled onClick={handleClick} onChange={handleChange}>
          禁用
        </SwitchButton>
      </ConfigProvider>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(handleChange).not.toHaveBeenCalled();
  });
});
