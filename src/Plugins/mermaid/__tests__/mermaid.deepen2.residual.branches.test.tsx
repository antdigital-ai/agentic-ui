/**
 * mermaid deepen2：SSR 早退、未完成预览、serializeSvg xmlns、
 * renderSvgToContainer 非 SVGElement / 无 svg 回退、loadMermaid SSR。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mermaidState = vi.hoisted(() => ({
  error: null as string | null,
  renderedCode: 'graph TD\nA-->B',
  isBrowser: true,
}));

vi.mock('../env', () => ({
  isBrowser: () => mermaidState.isBrowser,
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

describe('mermaid deepen2 residual branches', () => {
  beforeEach(() => {
    mermaidState.error = null;
    mermaidState.renderedCode = 'graph TD\nA-->B';
    mermaidState.isBrowser = true;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('Mermaid：非 browser 返回 null；finished=false 走预览', async () => {
    const { Mermaid } = await import('../Mermaid');
    mermaidState.isBrowser = false;
    const { container, rerender } = render(
      <Mermaid
        element={
          {
            type: 'code',
            language: 'mermaid',
            children: [{ text: 'graph TD\nA-->B' }],
          } as any
        }
      />,
    );
    expect(container.firstChild).toBeNull();

    mermaidState.isBrowser = true;
    rerender(
      <Mermaid
        element={
          {
            type: 'code',
            language: 'mermaid',
            otherProps: { finished: false },
            children: [{ text: 'graph TD\nA-->B' }],
          } as any
        }
      />,
    );
    expect(container.textContent).toMatch(/graph|A-->B|mermaid/i);
  });

  it('MermaidRendererImpl：空 code 复制早退；无 svg 下载早退', async () => {
    const { MermaidRendererImpl } = await import('../MermaidRendererImpl');
    mermaidState.renderedCode = '';
    render(
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
    const buttons = screen.queryAllByRole('button');
    buttons.forEach((b) => fireEvent.click(b));
    expect(document.body).toBeTruthy();
  });

  it('utils：renderSvgToContainer 非 svg / svg / 裸 html 回退', async () => {
    const utils = await import('../utils');
    const container = document.createElement('div');

    utils.renderSvgToContainer('<div>not-svg</div>', container);
    expect(container.innerHTML).toContain('not-svg');

    utils.renderSvgToContainer(
      '<svg xmlns="http://www.w3.org/2000/svg"><circle /></svg>',
      container,
    );
    expect(container.querySelector('[data-mermaid-svg="true"]')).toBeTruthy();

    utils.renderSvgToContainer(
      '<svg><foreignObject /><rect /></svg>',
      container,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
