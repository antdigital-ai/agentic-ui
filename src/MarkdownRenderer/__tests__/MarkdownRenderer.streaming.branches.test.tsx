/**
 * MarkdownRenderer：省略 streaming 使用默认 false。
 */
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../index';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(() =>
      Promise.resolve({ svg: '<svg><text>mock</text></svg>' }),
    ),
  },
}));

describe('MarkdownRenderer streaming default branches', () => {
  it('省略 streaming 时正常渲染静态内容', async () => {
    render(<MarkdownRenderer content="static text" />);
    await waitFor(() => {
      expect(screen.getByTestId('markdown-renderer').textContent).toContain(
        'static',
      );
    });
  });
});
