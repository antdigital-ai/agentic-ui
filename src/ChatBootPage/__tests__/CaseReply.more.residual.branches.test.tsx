/**
 * CaseReply more residual：无 cover、长 quote、回调 reject 捕获。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../../../_test_helpers/testUtils';
import CaseReply from '../CaseReply';

describe('CaseReply more residual branches', () => {
  it('无 coverBackground；长 quote 截断仍渲染', () => {
    render(
      <TestWrapper>
        <CaseReply quote={'q'.repeat(200)} title="Long" />
      </TestWrapper>,
    );
    expect(screen.getByText('Long')).toBeInTheDocument();
  });

  it('onClick async reject 被捕获', async () => {
    const onClick = vi.fn(() =>
      Promise.reject(new Error('x')).catch(() => undefined),
    );
    render(
      <TestWrapper>
        <CaseReply quote="q" title="Go" onClick={onClick} />
      </TestWrapper>,
    );
    fireEvent.click(screen.getByTestId('agentic-chatboot-case-reply'));
    expect(onClick).toHaveBeenCalled();
  });

  it('Space 键触发 onClick；无 onClick 时无 button role', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <TestWrapper>
        <CaseReply quote="q" title="Go" onClick={onClick} />
      </TestWrapper>,
    );
    const el = screen.getByTestId('agentic-chatboot-case-reply');
    fireEvent.keyDown(el, { key: ' ' });
    expect(onClick).toHaveBeenCalled();
    fireEvent.keyDown(el, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(el, { key: 'Escape' });
    expect(onClick).toHaveBeenCalledTimes(2);

    rerender(
      <TestWrapper>
        <CaseReply quote="q" title="Static" />
      </TestWrapper>,
    );
    expect(
      screen.getByTestId('agentic-chatboot-case-reply').getAttribute('role'),
    ).toBeNull();
  });
});
