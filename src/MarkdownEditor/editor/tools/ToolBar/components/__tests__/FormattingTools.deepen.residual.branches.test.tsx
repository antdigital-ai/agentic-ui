/**
 * FormattingTools deepen：isInTable / hideTools 默认参。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormattingTools } from '../FormattingTools';

describe('FormattingTools deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('省略 isInTable/hideTools：默认参渲染工具', () => {
    render(
      <FormattingTools
        baseClassName="tb"
        i18n={{ locale: {} }}
        tools={[
          {
            key: 'bold',
            type: 'bold',
            title: 'Bold',
            icon: <span>B</span>,
          },
        ]}
        editor={{}}
        isCodeNode={false}
        onToolClick={vi.fn()}
        isFormatActive={() => false}
      />,
    );
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
