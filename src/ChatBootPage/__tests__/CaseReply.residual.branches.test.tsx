/**
 * CaseReply residual：quote/title/cover/onClick 矩阵。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../../../_test_helpers/testUtils';
import CaseReply from '../CaseReply';

describe('CaseReply residual branches', () => {
  it('自定义 coverBackground 与 className', () => {
    render(
      <TestWrapper>
        <CaseReply
          quote="q"
          title="Title"
          coverBackground="#fff"
          className="extra"
        />
      </TestWrapper>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByTestId('agentic-chatboot-case-reply')).toBeInTheDocument();
  });

  it('onClick 触发', () => {
    const onClick = vi.fn();
    render(
      <TestWrapper>
        <CaseReply quote="quote text" title="Go" onClick={onClick} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByTestId('agentic-chatboot-case-reply'));
    expect(onClick).toHaveBeenCalled();
  });

  it('无 onClick 仍可渲染', () => {
    render(
      <TestWrapper>
        <CaseReply quote="" title="Empty quote" />
      </TestWrapper>,
    );
    expect(screen.getByText('Empty quote')).toBeInTheDocument();
  });
});
