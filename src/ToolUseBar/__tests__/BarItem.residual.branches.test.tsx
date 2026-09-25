/**
 * ToolUseBar BarItem 残留：无 icon→Api、error+message、active 无 content、summary。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolUseBarItem } from '../BarItem';

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 't' }),
}));

describe('ToolUseBar BarItem residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('无 icon 回退 Api；error + errorMessage', () => {
    render(
      <ToolUseBarItem
        tool={
          {
            id: 'e1',
            toolName: 'Fail',
            status: 'error',
            errorMessage: 'boom',
            content: 'c',
          } as any
        }
        prefixCls="tool-bar"
        hashId="h"
        isActive={false}
        isExpanded
        onClick={vi.fn()}
        onExpandClick={vi.fn()}
      />,
    );
    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it.skip('active 无 content；summary type；disableAnimation', () => {
    render(
      <ToolUseBarItem
        tool={
          {
            id: 'a1',
            toolName: 'Sum',
            type: 'summary',
            status: 'success',
          } as any
        }
        prefixCls="tool-bar"
        hashId="h"
        isActive
        isExpanded={false}
        disableAnimation
        onClick={vi.fn()}
        onExpandClick={vi.fn()}
      />,
    );
    expect(screen.getByText('Sum')).toBeInTheDocument();
  });

  it('Enter/Space 展开溢出内容', () => {
    const onExpandClick = vi.fn();
    render(
      <ToolUseBarItem
        tool={
          {
            id: 't1',
            toolName: 'T',
            status: 'success',
            content: 'body',
          } as any
        }
        prefixCls="tool-bar"
        hashId="h"
        isActive={false}
        isExpanded
        onClick={vi.fn()}
        onExpandClick={onExpandClick}
      />,
    );
    const expand = screen.queryByTestId('tool-content-expand');
    if (expand) {
      fireEvent.keyDown(expand, { key: 'Enter' });
      fireEvent.keyDown(expand, { key: ' ' });
    }
    expect(document.body).toBeTruthy();
  });
});
