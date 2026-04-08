/**
 * FormattingTools 组件测试
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FormattingTools } from '../../../../../../src/MarkdownEditor/editor/tools/ToolBar/components/FormattingTools';

const defaultTools = [
  { key: 'bold', type: 'bold', title: 'Bold', icon: <span>B</span> },
  { key: 'italic', type: 'italic', title: 'Italic', icon: <span>I</span> },
  { key: 'alignLeft', type: 'alignLeft', title: 'Align Left', icon: <span>L</span> },
];

describe('FormattingTools', () => {
  it('应在 isInTable 为 false 时展示全部工具', () => {
    render(
      <FormattingTools
        baseClassName="test-bar"
        i18n={{ locale: {} }}
        tools={defaultTools}
        editor={{}}
        isCodeNode={false}
        onToolClick={vi.fn()}
        isFormatActive={() => false}
        isInTable={false}
      />,
    );

    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('应在 isInTable 为 true 时只展示表格内允许的工具', () => {
    render(
      <FormattingTools
        baseClassName="test-bar"
        i18n={{ locale: {} }}
        tools={defaultTools}
        editor={{}}
        isCodeNode={false}
        onToolClick={vi.fn()}
        isFormatActive={() => false}
        isInTable={true}
      />,
    );

    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.queryByText('L')).not.toBeInTheDocument();
  });
});
