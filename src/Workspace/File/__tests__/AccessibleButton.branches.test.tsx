/**
 * AccessibleButton 分支覆盖：Enter / Space 键盘触发与忽略其它键。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccessibleButton } from '../components/AccessibleButton';

describe('AccessibleButton 分支覆盖', () => {
  afterEach(() => {
    cleanup();
  });

  it('Enter 键应触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <AccessibleButton
        icon={<span data-testid="icon">+</span>}
        onClick={onClick}
        ariaLabel="添加文件"
      />,
    );

    const btn = screen.getByRole('button', { name: '添加文件' });
    fireEvent.keyDown(btn, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space 键应触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <AccessibleButton
        icon={<span>icon</span>}
        onClick={onClick}
        ariaLabel="下载"
      />,
    );

    const btn = screen.getByRole('button', { name: '下载' });
    fireEvent.keyDown(btn, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('其它键不应触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <AccessibleButton
        icon={<span>icon</span>}
        onClick={onClick}
        ariaLabel="操作"
      />,
    );

    const btn = screen.getByRole('button', { name: '操作' });
    fireEvent.keyDown(btn, { key: 'Tab' });
    fireEvent.keyDown(btn, { key: 'Escape' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('鼠标点击仍应触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <AccessibleButton
        icon={<span>icon</span>}
        onClick={onClick}
        ariaLabel="点击"
        className="custom-btn"
        id="btn-1"
      />,
    );

    const btn = screen.getByRole('button', { name: '点击' });
    expect(btn).toHaveClass('custom-btn');
    expect(btn).toHaveAttribute('id', 'btn-1');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
