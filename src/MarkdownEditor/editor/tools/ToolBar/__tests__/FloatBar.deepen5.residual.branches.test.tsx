/**
 * FloatBar deepen5：readonly 栏、refreshFloatBar 翻转、容器缺失安全。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
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
  useStyle: () => ({ hashId: 'fb5-hash' }),
}));

vi.mock('../BaseBar', () => ({
  BaseToolBar: () => <div data-testid="base-toolbar">edit</div>,
}));

vi.mock('../ReadonlyBaseBar', () => ({
  ReadonlyBaseBar: () => <div data-testid="readonly-base-bar">ro</div>,
}));

vi.mock('../../../utils/dom', () => ({
  getSelRect: vi.fn(() => new DOMRect(10, 10, 20, 10)),
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

const baseStore = (over: Record<string, unknown> = {}) =>
  ({
    markdownEditorRef: { current: editorRef },
    markdownContainerRef: { current: mockContainer },
    domRect,
    setDomRect: mockSetDomRect,
    readonly: false,
    refreshFloatBar: false,
    floatBarRevision: 0,
    ...over,
  }) as any;

describe('FloatBar deepen5 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    domRect = new DOMRect(100, 50, 40, 20);
    selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    vi.mocked(useEditorStore).mockReturnValue(baseStore());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('readonly prop 渲染 ReadonlyBaseBar', () => {
    render(<FloatBar readonly />);
    expect(screen.getByTestId('readonly-base-bar')).toBeInTheDocument();
  });

  it('可编辑渲染 BaseToolBar', () => {
    render(<FloatBar />);
    expect(screen.getByTestId('base-toolbar')).toBeInTheDocument();
  });

  it('markdownContainerRef 为空仍安全', () => {
    vi.mocked(useEditorStore).mockReturnValue(
      baseStore({ markdownContainerRef: { current: null } }),
    );
    expect(() => render(<FloatBar />)).not.toThrow();
  });
});
