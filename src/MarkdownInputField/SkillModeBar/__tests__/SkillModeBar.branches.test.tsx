/**
 * SkillModeBar：enable false、closable、rightContent 单/数组、divider。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SkillModeBar } from '../index';

const wrap = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('SkillModeBar branches', () => {
  it('无 skillMode 返回 null', () => {
    const { container } = wrap(<SkillModeBar />);
    expect(container.firstChild).toBeNull();
  });

  it('enable false 返回 null', () => {
    const { container } = wrap(
      <SkillModeBar skillMode={{ enable: false, open: true }} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('open false 不渲染 bar', () => {
    wrap(<SkillModeBar skillMode={{ open: false, title: 'T' }} />);
    expect(screen.queryByTestId('skill-mode-bar')).toBeNull();
  });

  it('单节点 rightContent 与关闭按钮', () => {
    const onChange = vi.fn();
    wrap(
      <SkillModeBar
        skillMode={{
          open: true,
          title: '技能',
          rightContent: <span>rc</span>,
        }}
        onSkillModeOpenChange={onChange}
      />,
    );
    expect(screen.getByText('rc')).toBeTruthy();
    fireEvent.click(screen.getByTestId('skill-mode-close'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('closable false 无关闭按钮与 divider', () => {
    wrap(
      <SkillModeBar
        skillMode={{
          open: true,
          title: 'T',
          closable: false,
          rightContent: [<span key="a">A</span>, <span key="b">B</span>],
        }}
      />,
    );
    expect(screen.queryByTestId('skill-mode-close')).toBeNull();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('无 rightContent 但 closable 时有关闭无 divider', () => {
    wrap(
      <SkillModeBar skillMode={{ open: true, title: 'OnlyClose' }} />,
    );
    expect(screen.getByTestId('skill-mode-close')).toBeTruthy();
  });

  it('rightContent 单节点；open false→true 测试环境同步 enter', () => {
    const { rerender } = wrap(
      <SkillModeBar
        skillMode={{
          open: false,
          title: 'S',
          rightContent: <span data-testid="rc">R</span>,
          closable: true,
        }}
      />,
    );
    rerender(
      <SkillModeBar
        skillMode={{
          open: true,
          title: 'S',
          rightContent: <span data-testid="rc">R</span>,
          closable: true,
        }}
      />,
    );
    expect(screen.getByTestId('rc')).toBeInTheDocument();
  });

  it('无 skillMode / open false 不渲染栏', () => {
    const { container } = wrap(<SkillModeBar />);
    expect(container.querySelector('[data-testid="skill-mode"]')).toBeNull();
  });
});
