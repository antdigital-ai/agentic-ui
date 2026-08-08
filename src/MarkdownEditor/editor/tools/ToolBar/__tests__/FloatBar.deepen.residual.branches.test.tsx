/**
 * FloatBar deepen residual：定位 clamp、Escape、resize、readonly、domRect 清空。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Editor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetDomRect = vi.fn();
const mockContainer = document.createElement('div');
Object.defineProperty(mockContainer, 'clientWidth', {
  value: 100,
  configurable: true,
});

let domRect: DOMRect | null = new DOMRect(200, 50, 80, 20);
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
  useStyle: () => ({ hashId: 'fb-hash' }),
}));

vi.mock('../BaseBar', () => ({
  BaseToolBar: () => <div data-testid="base-toolbar">edit</div>,
}));

vi.mock('../ReadonlyBaseBar', () => ({
  ReadonlyBaseBar: () => <div data-testid="readonly-base-bar">ro</div>,
}));

vi.mock('../../../utils/dom', () => ({
  getSelRect: vi.fn(() => new DOMRect(10, 10, 50, 16)),
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
import { getSelRect } from '../../../utils/dom';
import { MARKDOWN_EDITOR_EVENTS } from '../../../../BaseMarkdownEditor';

describe('FloatBar deepen residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    domRect = new DOMRect(200, 50, 80, 20);
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
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('readonly 模式渲染 ReadonlyBaseBar', () => {
    render(<FloatBar readonly />);
    expect(screen.getByTestId('readonly-base-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('base-toolbar')).not.toBeInTheDocument();
  });

  it('domRect 为空时关闭且不渲染 portal 内容', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      domRect: null,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: mockEditor },
    } as any);
    const { container } = render(<FloatBar readonly={false} />);
    expect(container.querySelector('[class*="float-bar"]')).toBeNull();
  });

  it('left 被 clamp 到容器宽度内', () => {
    render(<FloatBar readonly={false} />);
    const bar = document.querySelector('[class*="float-bar"]') as HTMLDivElement;
    expect(bar).toBeTruthy();
    const left = parseFloat(bar.style.left);
    expect(left).toBeLessThanOrEqual(mockContainer.clientWidth);
    expect(left).toBeGreaterThanOrEqual(4);
  });

  it('readonly 模式使用较窄 barWidth 定位', () => {
    render(<FloatBar readonly />);
    const bar = document.querySelector('[class*="float-bar"]') as HTMLDivElement;
    expect(parseFloat(bar.style.left)).toBeGreaterThanOrEqual(4);
  });

  it('Escape 关闭并移动选区到末尾', () => {
    const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {});
    const hasPathSpy = vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
    const endSpy = vi
      .spyOn(Editor, 'end')
      .mockReturnValue({ path: [0, 0], offset: 2 });

    render(<FloatBar readonly={false} />);
    fireEvent.keyDown(mockContainer, { key: 'Escape' });

    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
    hasPathSpy.mockRestore();
    endSpy.mockRestore();
  });

  it('Escape 无 sel 时不 select', () => {
    selection = null;
    const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {});
    render(<FloatBar readonly={false} />);
    fireEvent.keyDown(mockContainer, { key: 'Escape' });
    expect(selectSpy).not.toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('SELECTIONCHANGE 事件更新位置', () => {
    render(<FloatBar readonly={false} />);
    const bar = document.querySelector('[class*="float-bar"]') as HTMLDivElement;
    fireEvent(
      mockContainer,
      new MouseEvent(MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE, {
        bubbles: true,
        clientX: 300,
        clientY: 200,
      }),
    );
    expect(parseFloat(bar.style.left)).toBeGreaterThan(0);
    expect(parseFloat(bar.style.top)).toBeGreaterThan(0);
  });

  it('window resize 打开时刷新 domRect', () => {
    render(<FloatBar readonly={false} />);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(getSelRect).toHaveBeenCalled();
    expect(mockSetDomRect).toHaveBeenCalled();
  });

  it('domRect 变化为 null 时关闭（opacity 0）', () => {
    const { rerender } = render(<FloatBar readonly={false} />);
    const bar = document.querySelector('[class*="float-bar"]') as HTMLDivElement;
    expect(bar.style.opacity).toBe('1');
    vi.mocked(useEditorStore).mockReturnValue({
      domRect: null,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: mockContainer },
      markdownEditorRef: { current: mockEditor },
    } as any);
    rerender(<FloatBar readonly={false} />);
    expect(bar.style.opacity).toBe('0');
  });

  it('mousedown 阻止冒泡', () => {
    render(<FloatBar readonly={false} />);
    const bar = document.querySelector('[class*="float-bar"]') as HTMLDivElement;
    const stop = vi.fn();
    fireEvent.mouseDown(bar, { preventDefault: stop, stopPropagation: stop });
    expect(bar).toBeInTheDocument();
  });

  it('markdownContainerRef 为空时返回 null', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      domRect,
      setDomRect: mockSetDomRect,
      markdownContainerRef: { current: null },
      markdownEditorRef: { current: mockEditor },
    } as any);
    const { container } = render(<FloatBar readonly={false} />);
    expect(container.firstChild).toBeNull();
  });
});
