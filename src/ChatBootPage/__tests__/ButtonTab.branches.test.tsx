/**
 * ButtonTab 分支覆盖：disabled、icon 键盘、selected 态。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../../../_test_helpers/testUtils';
import ButtonTab from '../ButtonTab';

describe('ButtonTab branches', () => {
  it('disabled 阻止 onClick', () => {
    const onClick = vi.fn();
    render(
      <TestWrapper>
        <ButtonTab disabled onClick={onClick}>
          Tab
        </ButtonTab>
      </TestWrapper>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('selected 应用选中类名', () => {
    render(
      <TestWrapper>
        <ButtonTab selected>Tab</ButtonTab>
      </TestWrapper>,
    );
    expect(screen.getByRole('button').className).toContain('selected');
  });

  it('onIconClick 点击图标不冒泡到主按钮', () => {
    const onClick = vi.fn();
    const onIconClick = vi.fn();
    render(
      <TestWrapper>
        <ButtonTab
          onClick={onClick}
          onIconClick={onIconClick}
          icon={<span data-testid="ico">I</span>}
        >
          Tab
        </ButtonTab>
      </TestWrapper>,
    );
    fireEvent.click(screen.getByTestId('ico'));
    expect(onIconClick).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('icon Enter 键触发 onIconClick', () => {
    const onIconClick = vi.fn();
    render(
      <TestWrapper>
        <ButtonTab onIconClick={onIconClick} icon={<span data-testid="ico">I</span>}>
          Tab
        </ButtonTab>
      </TestWrapper>,
    );
    const iconBtn = screen.getByTestId('ico').parentElement!;
    fireEvent.keyDown(iconBtn, { key: 'Enter' });
    expect(onIconClick).toHaveBeenCalled();
  });

  it('disabled 时 icon 无 role=button', () => {
    render(
      <TestWrapper>
        <ButtonTab disabled onIconClick={vi.fn()} icon={<span>I</span>}>
          Tab
        </ButtonTab>
      </TestWrapper>,
    );
    expect(screen.getByText('I').parentElement?.getAttribute('role')).toBeNull();
  });

  it('disabled icon 点击不触发 onIconClick', () => {
    const onIconClick = vi.fn();
    render(
      <TestWrapper>
        <ButtonTab disabled onIconClick={onIconClick} icon={<span data-testid="ico">I</span>}>
          Tab
        </ButtonTab>
      </TestWrapper>,
    );
    fireEvent.click(screen.getByTestId('ico'));
    expect(onIconClick).not.toHaveBeenCalled();
  });
});
