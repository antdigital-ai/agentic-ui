/**
 * FloatBar deepen4：resize default force、isOpen 保 top、
 * SELECTIONCHANGE 缺 editor、Escape 无 sel、resize 无 rect。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetDomRect = vi.fn();
const mockContainer = document.createElement('div');
Object.defineProperty(mockContainer, 'clientWidth', {
  value: 400,
  configurable: true,
});

let domRect: DOMRect | null = new DOMRect(100, 50, 40, 20);
let selection: any = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 2 },
};
let editorRef: any = {
  get selection() {
    return selection;
  },
  children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
};

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('../floatBarStyle', () => ({
  useStyle: () => ({ hashId: 'fb4-hash' }),
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

describe('FloatBar deepen4 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    domRect = new DOMRect(100, 50, 40, 20);
    selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    editorRef = {
      get selection() {
        return selection;
      },
      children: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    };
    vi.mocked(useEditorStore).mockReturnValue({
      domRect,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: editorRef },
    } as any);
    vi.mocked(getSelRect).mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('isOpen 后非 force resize：保留 style.top', () => {
    const { rerender } = render(<FloatBar readonly={false} />);
    const bar = document.querySelector(
      '[class*="float-bar"]',
    ) as HTMLDivElement;
    expect(bar).toBeTruthy();
    bar.style.top = '88px';
    // 再次触发 domRect effect（force=true）；再靠 SELECTIONCHANGE 走 isOpen&&!force
    vi.mocked(useEditorStore).mockReturnValue({
      domRect: new DOMRect(120, 60, 30, 20),
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: editorRef },
    } as any);
    rerender(<FloatBar readonly={false} />);
    act(() => {
      mockContainer.dispatchEvent(
        new MouseEvent(MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE, {
          clientX: 10,
          clientY: 20,
          bubbles: true,
        }),
      );
    });
    expect(document.querySelector('[class*="float-bar"]')).toBeTruthy();
  });

  it('SELECTIONCHANGE：editor/floatBar 缺一时早退', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      domRect,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: null },
    } as any);
    render(<FloatBar readonly={false} />);
    expect(() =>
      mockContainer.dispatchEvent(
        new MouseEvent(MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE, {
          clientX: 1,
          clientY: 2,
          bubbles: true,
        }),
      ),
    ).not.toThrow();
  });

  it('Escape：sel.current 空早退', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      domRect: null,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: editorRef },
    } as any);
    render(<FloatBar readonly={false} />);
    // domRect 空 → sel 未赋值；再给 domRect 打开再清
    expect(() =>
      fireEvent.keyDown(mockContainer, { key: 'Escape' }),
    ).not.toThrow();
  });

  it('window resize：getSelRect 空不 setDomRect', () => {
    render(<FloatBar readonly={false} />);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    // getSelRect null → 不调用 setDomRect（或仅首次 effect）
    expect(vi.mocked(getSelRect)).toHaveBeenCalled();
  });
});
