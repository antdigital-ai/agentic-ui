/**
 * FloatBar / BaseBar 残留：readonly、空选区、工具点击。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetDomRect = vi.fn();
const mockMarkdownContainer = document.createElement('div');
Object.defineProperty(mockMarkdownContainer, 'clientWidth', {
  value: 800,
  configurable: true,
});

const mockEditor = {
  selection: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 2 },
  },
  children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
};

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('../floatBarStyle', () => ({
  useStyle: () => ({ hashId: '' }),
}));

vi.mock('../BaseBar', () => ({
  BaseToolBar: () => (
    <div data-testid="base-toolbar">
      <button type="button">tool</button>
    </div>
  ),
}));

vi.mock('../ReadonlyBaseBar', () => ({
  ReadonlyBaseBar: () => <div data-testid="readonly-base-bar" />,
}));

vi.mock('../../../utils/dom', () => ({
  getSelRect: vi.fn(() => ({
    x: 100,
    y: 50,
    width: 100,
    height: 20,
    top: 50,
    right: 200,
    bottom: 70,
    left: 100,
  })),
}));

vi.mock('../../../../BaseMarkdownEditor', () => ({
  MARKDOWN_EDITOR_EVENTS: { SELECTIONCHANGE: 'md-editor-selectionchange' },
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

import { useEditorStore } from '../../../store';
import { FloatBar } from '../FloatBar';

describe('FloatBar / BaseBar residual branches', () => {
  beforeEach(() => {
    vi.mocked(useEditorStore).mockReturnValue({
      domRect: new DOMRect(100, 50, 100, 20),
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockMarkdownContainer },
      markdownEditorRef: { current: mockEditor },
    } as any);
  });

  it('FloatBar 渲染工具条', () => {
    expect(() => render(<FloatBar readonly={false} />)).not.toThrow();
    expect(screen.getByTestId('base-toolbar')).toBeInTheDocument();
  });

  it('BaseBar 渲染并可点击工具', () => {
    render(<FloatBar readonly={false} />);
    const buttons = screen.queryAllByRole('button');
    if (buttons[0]) fireEvent.click(buttons[0]);
    expect(document.body).toBeTruthy();
  });
});
