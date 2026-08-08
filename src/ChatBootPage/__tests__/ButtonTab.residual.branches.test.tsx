/**
 * ButtonTab residual：无 children、Space 图标键、自定义 prefixCls。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../../../_test_helpers/testUtils';
import ButtonTab from '../ButtonTab';

describe('ButtonTab residual branches', () => {
  it('无 children 仅图标；主按钮可点', () => {
    const onClick = vi.fn();
    render(
      <TestWrapper>
        <ButtonTab onClick={onClick} icon={<span>I</span>} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByTestId('agentic-chatboot-button-tab'));
    expect(onClick).toHaveBeenCalled();
  });

  it('icon Space 键触发 onIconClick；其它键忽略', () => {
    const onIconClick = vi.fn();
    render(
      <TestWrapper>
        <ButtonTab
          onIconClick={onIconClick}
          icon={<span data-testid="ico">I</span>}
        >
          Tab
        </ButtonTab>
      </TestWrapper>,
    );
    const iconBtn = screen.getByTestId('ico').parentElement!;
    fireEvent.keyDown(iconBtn, { key: ' ' });
    expect(onIconClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(iconBtn, { key: 'Escape' });
    expect(onIconClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 时 icon Enter 无效；自定义 className/prefixCls', () => {
    const onIconClick = vi.fn();
    render(
      <TestWrapper>
        <ButtonTab
          disabled
          className="extra"
          prefixCls="custom-tab"
          onIconClick={onIconClick}
          icon={<span data-testid="ico">I</span>}
        >
          Tab
        </ButtonTab>
      </TestWrapper>,
    );
    const iconBtn = screen.getByTestId('ico').parentElement!;
    fireEvent.keyDown(iconBtn, { key: 'Enter' });
    expect(onIconClick).not.toHaveBeenCalled();
    expect(screen.getByTestId('agentic-chatboot-button-tab').className).toContain(
      'extra',
    );
  });

  it('无 icon 时仅渲染 children', () => {
    render(
      <TestWrapper>
        <ButtonTab>Plain</ButtonTab>
      </TestWrapper>,
    );
    expect(screen.getByText('Plain')).toBeInTheDocument();
  });
});
