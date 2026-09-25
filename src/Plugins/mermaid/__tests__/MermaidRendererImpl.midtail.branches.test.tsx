/**
 * MermaidRendererImpl mid-tail：可见性、复制、下载、错误态。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MermaidRendererImpl } from '../MermaidRendererImpl';

const mermaidState = vi.hoisted(() => ({
  error: null as string | null,
  renderedCode: 'graph TD\nA-->B',
}));

vi.mock('../useMermaidRender', () => ({
  useMermaidRender: () => ({
    error: mermaidState.error,
    renderedCode: mermaidState.renderedCode,
  }),
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../../../MarkdownEditor/editor/utils/codeBlockPlainText', () => ({
  getSlateElementPlainText: () => 'graph TD\nA-->B',
}));

describe('MermaidRendererImpl midtail branches', () => {
  beforeEach(() => {
    mermaidState.error = null;
    mermaidState.renderedCode = 'graph TD\nA-->B';
  });

  it('渲染成功态工具栏：复制与下载', () => {
    const { container } = render(
      <ConfigProvider>
        <MermaidRendererImpl
          element={
            {
              type: 'code',
              language: 'mermaid',
              children: [{ text: 'graph TD\nA-->B' }],
            } as any
          }
        />
      </ConfigProvider>,
    );
    expect(container.querySelector('[class*="mermaid"]') || container.firstChild).toBeTruthy();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[0]);
  });

  it('error 态展示源码 pre', () => {
    mermaidState.error = 'parse failed';
    mermaidState.renderedCode = '';
    const { container } = render(
      <ConfigProvider>
        <MermaidRendererImpl
          element={
            {
              type: 'code',
              language: 'mermaid',
              children: [{ text: 'bad' }],
            } as any
          }
        />
      </ConfigProvider>,
    );
    expect(container.querySelector('[class*="mermaid-error"]')).toBeTruthy();
    expect(container.querySelector('pre')).toHaveTextContent(/graph TD/);
  });

  it('空 renderedCode 无 error 时展示 empty', () => {
    mermaidState.error = null;
    mermaidState.renderedCode = '';
    const { container } = render(
      <ConfigProvider>
        <MermaidRendererImpl
          element={
            {
              type: 'code',
              language: 'mermaid',
              children: [{ text: '' }],
            } as any
          }
        />
      </ConfigProvider>,
    );
    expect(container.querySelector('[class*="mermaid-empty"]')).toBeTruthy();
  });
});
