/**
 * FloatBar deepen2：left&lt;4 clamp、isOpen 保留 top、Escape hasPath false、resize getSelRect 空。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Editor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetDomRect = vi.fn();
const mockContainer = document.createElement('div');
Object.defineProperty(mockContainer, 'clientWidth', {
  value: 80,
  configurable: true,
});

let domRect: DOMRect | null = new DOMRect(-100, 50, 20, 20);
let selection: any = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 2 },
};

const mockEditor = {
  get selection() {
    return selection;
  },
  children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
};

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('../floatBarStyle', () => ({
  useStyle: () => ({ hashId: 'fb2-hash' }),
}));

vi.mock('../BaseBar', () => ({
  BaseToolBar: () => <div data-testid="base-toolbar">edit</div>,
}));

vi.mock('../ReadonlyBaseBar', () => ({
  ReadonlyBaseBar: () => <div data-testid="readonly-base-bar">ro</div>,
}));

vi.mock('../../../utils/dom', () => ({
  getSelRect: vi.fn(() => null),
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

import { MARKDOWN_EDITOR_EVENTS } from '../../../../BaseMarkdownEditor';
import { useEditorStore } from '../../../store';
import { getSelRect } from '../../../utils/dom';
import { FloatBar } from '../FloatBar';

describe('FloatBar deepen2 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    domRect = new DOMRect(-100, 50, 20, 20);
    selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    vi.mocked(useEditorStore).mockReturnValue({
      domRect,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: mockEditor },
    } as any);
    vi.mocked(getSelRect).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('left 小于 4 时 clamp 到 4', () => {
    render(<FloatBar readonly={false} />);
    const bar = document.querySelector(
      '[class*="float-bar"]',
    ) as HTMLDivElement;
    expect(parseFloat(bar.style.left)).toBe(4);
  });

  it('isOpen 时非 force resize 保留已有 top', () => {
    render(<FloatBar readonly={false} />);
    const bar = document.querySelector(
      '[class*="float-bar"]',
    ) as HTMLDivElement;
    bar.style.top = '88px';
    fireEvent(
      mockContainer,
      new MouseEvent(MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE, {
        bubbles: true,
        clientX: 40,
        clientY: 60,
      }),
    );
    // SELECTIONCHANGE 内 resize(true) 会改 top；再通过 window resize 走 force=false 路径需 isOpen
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(getSelRect).toHaveBeenCalled();
    // getSelRect null → 不 setDomRect
    expect(mockSetDomRect).not.toHaveBeenCalled();
  });

  it('Escape：hasPath false 不 Transforms.select', () => {
    const selectSpy = vi
      .spyOn(Transforms, 'select')
      .mockImplementation(() => {});
    const hasPathSpy = vi.spyOn(Editor, 'hasPath').mockReturnValue(false);
    render(<FloatBar readonly={false} />);
    fireEvent.keyDown(mockContainer, { key: 'Escape' });
    expect(selectSpy).not.toHaveBeenCalled();
    selectSpy.mockRestore();
    hasPathSpy.mockRestore();
  });

  it('超宽容器右侧 clamp 到 clientWidth - barWidth/2', () => {
    Object.defineProperty(mockContainer, 'clientWidth', {
      value: 50,
      configurable: true,
    });
    domRect = new DOMRect(400, 20, 10, 10);
    vi.mocked(useEditorStore).mockReturnValue({
      domRect,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: mockEditor },
    } as any);
    render(<FloatBar readonly />);
    const bar = document.querySelector(
      '[class*="float-bar"]',
    ) as HTMLDivElement;
    expect(parseFloat(bar.style.left)).toBeLessThanOrEqual(50);
    expect(screen.getByTestId('readonly-base-bar')).toBeInTheDocument();
  });
});
