/**
 * AttachmentButton：title truthy 时渲染 span。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentButton } from '../index';

vi.mock('../AttachmentButtonPopover', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SupportedFileFormats: { image: 'image' },
}));

describe('AttachmentButton branches', () => {
  it('title 有值时渲染标题 span', () => {
    render(
      <ConfigProvider>
        <AttachmentButton title="Attach" uploadImage={vi.fn()} />
      </ConfigProvider>,
    );
    expect(screen.getByText('Attach')).toBeInTheDocument();
  });
});
