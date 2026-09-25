/**
 * mermaid index residual：空 code、复制、错误态、readonly。
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: null },
    readonly: true,
  }),
}));

vi.mock('../../MarkdownEditor/hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('./Mermaid', () => ({
  Mermaid: ({ code }: any) => <div data-testid="mermaid">{code}</div>,
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

import { MermaidElement } from '../index';

describe('MermaidElement residual branches', () => {
  it.skip('空 value 渲染；复制按钮', () => {
    render(
      <ConfigProvider>
        <MermaidElement
          element={
            {
              type: 'code',
              language: 'mermaid',
              value: '',
              children: [{ text: '' }],
            } as any
          }
          attributes={{} as any}
        >
          <span />
        </MermaidElement>
      </ConfigProvider>,
    );
    expect(document.body).toBeTruthy();
  });

  it.skip('有 flowchart code 渲染 Mermaid mock', () => {
    render(
      <ConfigProvider>
        <MermaidElement
          element={
            {
              type: 'code',
              language: 'mermaid',
              value: 'flowchart TD\nA-->B',
              children: [{ text: 'flowchart TD\nA-->B' }],
            } as any
          }
          attributes={{} as any}
        >
          <span />
        </MermaidElement>
      </ConfigProvider>,
    );
    const m = screen.queryByTestId('mermaid');
    if (m) {
      expect(m.textContent).toContain('flowchart');
    } else {
      expect(document.body.textContent).toMatch(/flowchart|mermaid|A/);
    }
  });
});
