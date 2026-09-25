/**
 * CaseReply：省略 coverBackground 时使用默认值。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../../../_test_helpers/testUtils';
import CaseReply from '../CaseReply';

describe('CaseReply branches', () => {
  it('省略 coverBackground 时使用默认背景色', () => {
    render(
      <TestWrapper>
        <CaseReply quote="q" title="t" />
      </TestWrapper>,
    );
    const cover = screen
      .getByTestId('agentic-chatboot-case-reply')
      .querySelector('[class*="cover"]');
    expect(cover).toHaveStyle({ background: 'rgba(132, 220, 24, 0.15)' });
  });

  it('自定义 coverBackground / description / onClick', () => {
    const onClick = vi.fn();
    render(
      <TestWrapper>
        <CaseReply
          quote="quote"
          title="title"
          description="desc"
          coverBackground="#112233"
          onClick={onClick}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('desc')).toBeTruthy();
    const root = screen.getByTestId('agentic-chatboot-case-reply');
    root.click();
    expect(onClick).toHaveBeenCalled();
  });
});
