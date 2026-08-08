/**
 * ChatLayout：省略 footerHeight 时使用默认 48。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../../../_test_helpers/testUtils';
import { ChatLayout } from '../index';

vi.mock('../../Hooks/useElementSize', () => ({
  useElementSize: () => ({
    ref: vi.fn(),
    height: 0,
  }),
}));

describe('ChatLayout branches', () => {
  it('省略 footerHeight 时 footer 占位与 minHeight 使用 48', () => {
    const { container } = render(
      <TestWrapper>
        <ChatLayout footer={<div>input</div>}>content</ChatLayout>
      </TestWrapper>,
    );
    const spacer = container.querySelector('[aria-hidden="true"]');
    expect(spacer).toHaveStyle({ height: '48px' });
    const footer = container.querySelector('[class*="footer"]:not([class*="background"])');
    expect(footer).toHaveStyle({ minHeight: '48px' });
  });
});
