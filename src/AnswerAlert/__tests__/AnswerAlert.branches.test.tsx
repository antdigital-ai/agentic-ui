/**
 * AnswerAlert 补充分支：无 type 的 aria、closing 忽略二次点击、子元素 animationend 忽略。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerAlert } from '../index';

describe('AnswerAlert 分支补充', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 type 时不设置 role，aria-live 为 polite', () => {
    render(<AnswerAlert message="plain" />);
    const alert = screen.getByTestId('ant-answer-alert');
    expect(alert).not.toHaveAttribute('role');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('showIcon 无 type 时 IconNode 返回 null', () => {
    const { container } = render(
      <AnswerAlert message="m" showIcon />,
    );
    expect(container.querySelector('.ant-answer-alert-icon')).toBeNull();
  });

  it('自定义 icon 带 className 时合并', () => {
    render(
      <AnswerAlert
        message="m"
        showIcon
        type="info"
        icon={<span className="my-icon" data-testid="ico">i</span>}
      />,
    );
    expect(screen.getByTestId('ico')).toHaveClass('my-icon');
    expect(screen.getByTestId('ico').className).toMatch(/answer-alert-icon/);
  });

  it('closing 中再次点击不重复 onClose', () => {
    const onClose = vi.fn();
    render(
      <AnswerAlert message="m" closable motion onClose={onClose} />,
    );
    const btn = screen.getByLabelText('Close');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('子元素 animationend 不触发卸载，容器 animationend 才卸载', () => {
    const onClose = vi.fn();
    render(
      <AnswerAlert
        message={<span data-testid="child">c</span>}
        closable
        motion
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByLabelText('Close'));
    const child = screen.getByTestId('child');
    act(() => {
      child.dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(screen.getByTestId('ant-answer-alert')).toBeInTheDocument();

    const root = screen.getByTestId('ant-answer-alert');
    act(() => {
      root.dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(screen.queryByTestId('ant-answer-alert')).not.toBeInTheDocument();
  });

  it('transitionend 也可完成关闭', () => {
    render(<AnswerAlert message="m" closable motion />);
    fireEvent.click(screen.getByLabelText('Close'));
    const root = screen.getByTestId('ant-answer-alert');
    act(() => {
      root.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });
    expect(screen.queryByTestId('ant-answer-alert')).not.toBeInTheDocument();
  });
});
