/**
 * ToolBar 子组件：locale falsy 回退、isInTable/role 默认。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ClearFormatButton } from '../ClearFormatButton';
import { FormatButton } from '../FormatButton';
import { FormattingTools } from '../FormattingTools';
import { ToolBarItem } from '../ToolBarItem';

describe('ToolBar components branches', () => {
  it('ClearFormatButton locale.clearFormatting falsy 时使用默认文案', () => {
    render(
      <ClearFormatButton
        baseClassName="tb"
        i18n={{ locale: {} }}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('FormatButton locale.format falsy 时使用默认文案', () => {
    render(
      <FormatButton
        baseClassName="tb"
        i18n={{ locale: {} }}
        onFormat={vi.fn()}
      />,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('FormattingTools 省略 isInTable 时不按表格过滤', () => {
    const tools = [
      { key: 'align-left', type: 'align-left', icon: <span>a</span> },
      { key: 'bold', type: 'bold', icon: <span>b</span> },
    ];
    render(
      <FormattingTools
        baseClassName="tb"
        i18n={{ locale: {} }}
        tools={tools}
        editor={{}}
        isCodeNode={false}
        onToolClick={vi.fn()}
        isFormatActive={() => false}
      />,
    );
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('ToolBarItem 省略 role 时默认 button', () => {
    render(<ToolBarItem icon={<span>i</span>} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('ToolBarItem 无 title 时不包 Tooltip 且可点击', () => {
    const onClick = vi.fn();
    render(<ToolBarItem icon={<span>x</span>} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
