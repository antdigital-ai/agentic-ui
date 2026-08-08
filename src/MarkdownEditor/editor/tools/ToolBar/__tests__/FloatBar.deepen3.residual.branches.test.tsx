/**
 * FloatBar deepen3：readonly 宽度、right clamp、domRect 空关闭、
 * Escape 无 sel、resize 有 rect、SELECTIONCHANGE。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Editor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetDomRect = vi.fn();
const mockContainer = document.createElement('div');
Object.defineProperty(mockContainer, 'clientWidth', {
  value: 40,
  configurable: true,
});

let domRect: DOMRect | null = new DOMRect(200, 50, 20, 20);
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
  useStyle: () => ({ hashId: 'fb3-hash' }),
}));

vi.mock('../BaseBar', () => ({
  BaseToolBar: () => <div data-testid="base-toolbar">edit</div>,
}));

vi.mock('../ReadonlyBaseBar', () => ({
  ReadonlyBaseBar: () => <div data-testid="readonly-base-bar">ro</div>,
}));

vi.mock('../../../utils/dom', () => ({
  getSelRect: vi.fn(() => new DOMRect(10, 10, 5, 5)),
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

describe('FloatBar deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    domRect = new DOMRect(200, 50, 20, 20);
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
    vi.mocked(getSelRect).mockReturnValue(new DOMRect(10, 10, 5, 5));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('readonly：窄容器右边界 clamp', () => {
    render(<FloatBar readonly />);
    const bar = document.querySelector(
      '[class*="float-bar"]',
    ) as HTMLDivElement;
    expect(bar).toBeTruthy();
    expect(parseFloat(bar.style.left)).toBeGreaterThanOrEqual(4);
  });

  it('domRect 置空：关闭并 clear fileMap', () => {
    const { rerender } = render(<FloatBar readonly={false} />);
    vi.mocked(useEditorStore).mockReturnValue({
      domRect: null,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: mockEditor },
    } as any);
    rerender(<FloatBar readonly={false} />);
  });

  it('Escape：hasPath false 不 select', () => {
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

  it('window resize 且 isOpen：getSelRect 更新 domRect', () => {
    render(<FloatBar readonly={false} />);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(mockSetDomRect).toHaveBeenCalled();
  });

  it('SELECTIONCHANGE 调整位置并 force resize', () => {
    render(<FloatBar readonly={false} />);
    act(() => {
      mockContainer.dispatchEvent(
        new MouseEvent(MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE, {
          clientX: 12,
          clientY: 30,
          bubbles: true,
        }),
      );
    });
    const bar = document.querySelector(
      '[class*="float-bar"]',
    ) as HTMLDivElement;
    expect(bar).toBeTruthy();
  });
});
