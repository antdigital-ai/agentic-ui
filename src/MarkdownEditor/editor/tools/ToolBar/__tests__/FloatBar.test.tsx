/**
 * FloatBar 组件测试
 */

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FloatBar } from '../FloatBar';

const mockSetDomRect = vi.fn();
const mockMarkdownContainer = document.createElement('div');
Object.defineProperty(mockMarkdownContainer, 'clientWidth', {
  value: 800,
  configurable: true,
});

const mockEditor = {
  selection: { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 5 } },
  children: [{ type: 'paragraph', children: [{ text: 'x' }] }],
};
const mockMarkdownEditorRef = { current: mockEditor };

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('../floatBarStyle', () => ({
  useStyle: () => ({ wrapSSR: (node: React.ReactNode) => node, hashId: '' }),
}));

vi.mock('../BaseBar', () => ({
  BaseToolBar: ({ prefix }: any) => <div data-testid="base-toolbar">{prefix}</div>,
}));

vi.mock('../ReadonlyBaseBar', () => ({
  ReadonlyBaseBar: ({ prefix }: any) => <div data-testid="readonly-base-bar">{prefix}</div>,
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

const mockRangeEnd = vi.fn(() => [0, 0]);
const mockEditorHasPath = vi.fn(() => true);
const mockEditorEnd = vi.fn(() => ({ path: [0, 0], offset: 0 }));
const mockTransformsSelect = vi.fn();

vi.mock('slate', () => ({
  ...vi.importActual('slate'),
  Range: { end: (...args: any[]) => mockRangeEnd(...args) },
  Editor: {
    ...vi.importActual('slate').Editor,
    hasPath: (...args: any[]) => mockEditorHasPath(...args),
    end: (...args: any[]) => mockEditorEnd(...args),
  },
  Transforms: {
    ...vi.importActual('slate').Transforms,
    select: (...args: any[]) => mockTransformsSelect(...args),
  },
}));

vi.mock('../../../../BaseMarkdownEditor', () => ({
  MARKDOWN_EDITOR_EVENTS: { SELECTIONCHANGE: 'md-editor-selectionchange' },
}));

const { useEditorStore } = await import('../../../store');

describe('FloatBar', () => {
  const defaultStore = {
    domRect: new DOMRect(100, 50, 100, 20),
    setDomRect: mockSetDomRect,
    markdownContainerRef: { current: mockMarkdownContainer },
    markdownEditorRef: mockMarkdownEditorRef as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkdownContainer.innerHTML = '';
    vi.mocked(useEditorStore).mockReturnValue(defaultStore as any);
  });

  function getFloatBarRoot(): HTMLElement | null {
    const child = document.body.querySelector('[data-testid="base-toolbar"]');
    return child?.parentElement ?? null;
  }

  it('应在有 domRect 和 container 时执行 resize 并定位（32 等）', () => {
    render(<FloatBar readonly={false} />);

    const floatBar = getFloatBarRoot();
    expect(floatBar).toBeInTheDocument();
    expect(floatBar?.style.left).toBeTruthy();
    expect(floatBar?.style.top).toBeTruthy();
  });

  it('应按 Escape 时关闭并选中选区（90-100）', () => {
    render(<FloatBar readonly={false} />);

    const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    const preventDefault = vi.spyOn(ev, 'preventDefault');
    mockMarkdownContainer.dispatchEvent(ev);

    expect(preventDefault).toHaveBeenCalled();
    expect(mockEditorHasPath).toHaveBeenCalled();
    expect(mockTransformsSelect).toHaveBeenCalled();
  });

  it('应在 window resize 且 isOpen 时调用 setDomRect 和 resize（115-120）', async () => {
    const { getSelRect } = await import('../../../utils/dom');
    vi.mocked(getSelRect).mockReturnValue(new DOMRect(80, 40, 80, 18));

    render(<FloatBar readonly={false} />);

    await act(async () => {
      fireEvent(window, new Event('resize'));
    });

    expect(getSelRect).toHaveBeenCalled();
    expect(mockSetDomRect).toHaveBeenCalled();
  });

  it('resize 时未 mock getSelRect 返回值时使用默认实现', async () => {
    const { getSelRect } = await import('../../../utils/dom');
    vi.mocked(getSelRect).mockReset();
    vi.mocked(getSelRect).mockImplementation(() => ({
      x: 100,
      y: 50,
      width: 100,
      height: 20,
      top: 50,
      right: 200,
      bottom: 70,
      left: 100,
    }));
    render(<FloatBar readonly={false} />);

    await act(async () => {
      fireEvent(window, new Event('resize'));
    });

    expect(getSelRect).toHaveBeenCalled();
    const ret = vi.mocked(getSelRect).mock.results[0]?.value;
    expect(ret).toBeDefined();
    expect(ret?.x).toBe(100);
    expect(ret?.y).toBe(50);
    expect(ret?.width).toBe(100);
    expect(ret?.height).toBe(20);
  });

  it('应在 div onMouseDown 时 preventDefault 和 stopPropagation（145-146）', () => {
    render(<FloatBar readonly={false} />);

    const floatBar = getFloatBarRoot();
    expect(floatBar).toBeInTheDocument();
    const ev = new MouseEvent('mousedown', { bubbles: true });
    const preventDefault = vi.spyOn(ev, 'preventDefault');
    const stopPropagation = vi.spyOn(ev, 'stopPropagation');
    floatBar!.dispatchEvent(ev);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('readonly 时应渲染 ReadonlyBaseBar', () => {
    render(<FloatBar readonly={true} />);
    expect(document.body.querySelector('[data-testid="readonly-base-bar"]')).toBeInTheDocument();
  });

  it('非 readonly 时应渲染 BaseToolBar', () => {
    render(<FloatBar readonly={false} />);
    expect(document.body.querySelector('[data-testid="base-toolbar"]')).toBeInTheDocument();
  });

  it('无 markdownContainerRef.current 时应 return null', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      markdownContainerRef: { current: null },
    } as any);

    const { container } = render(<FloatBar readonly={false} />);

    expect(container.firstChild).toBeNull();
    expect(getFloatBarRoot()).toBeNull();
  });
});
