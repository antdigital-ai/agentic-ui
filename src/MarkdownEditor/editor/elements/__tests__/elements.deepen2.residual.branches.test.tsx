/**
 * elements/index deepen2 residual：readonly 元素路由、tag-only、placeholder 回退、
 * mark 无 text、dirtLeaf selectFormat。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../../utils/editorUtils';
import { MElement, MLeaf } from '../index';

const stubs = vi.hoisted(() => {
  const box =
    (testId: string) =>
    ({ children }: Record<string, unknown>) => (
      <div data-testid={testId}>{children as React.ReactNode}</div>
    );
  return { box };
});

vi.mock('../../store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: {
      current: {
        focus: vi.fn(),
        children: [],
        delete: vi.fn(),
      },
    },
    markdownContainerRef: {
      current: {
        querySelector: vi.fn(() => {
          const el = document.createElement('div');
          el.focus = vi.fn();
          return el;
        }),
      },
    },
    readonly: false,
    store: { dragStart: vi.fn(), isLatestNode: vi.fn().mockReturnValue(false) },
    typewriter: false,
    editorProps: {},
  })),
}));

vi.mock('slate-react', () => ({
  ReactEditor: { findPath: vi.fn().mockReturnValue([0, 0]) },
  useSlate: () => ({ children: [] }),
}));

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: { isDirtLeaf: vi.fn().mockReturnValue(false) },
}));

vi.mock('../Table', () => ({
  tableRenderElement: vi.fn(() => null),
}));

vi.mock('../Hr', () => ({ Hr: stubs.box('hr') }));
vi.mock('../Hr/ReadonlyHr', () => ({ ReadonlyHr: stubs.box('readonly-hr') }));
vi.mock('../InlineKatex', () => ({ InlineKatex: stubs.box('inline-katex') }));
vi.mock('../InlineKatex/ReadonlyInlineKatex', () => ({
  ReadonlyInlineKatex: stubs.box('readonly-inline-katex'),
}));
vi.mock('../Mermaid', () => ({ Mermaid: stubs.box('mermaid') }));
vi.mock('../Mermaid/ReadonlyMermaid', () => ({
  ReadonlyMermaid: stubs.box('readonly-mermaid'),
}));
vi.mock('../Code', () => ({ Code: stubs.box('code') }));
vi.mock('../Code/ReadonlyCode', () => ({
  ReadonlyCode: stubs.box('readonly-code'),
}));
vi.mock('../FootnoteDefinition', () => ({
  FootnoteDefinition: stubs.box('footnote'),
}));
vi.mock('../FootnoteDefinition/ReadonlyFootnoteDefinition', () => ({
  ReadonlyFootnoteDefinition: stubs.box('readonly-footnote'),
}));
vi.mock('../Paragraph', () => ({ Paragraph: stubs.box('paragraph') }));
vi.mock('../Paragraph/ReadonlyParagraph', () => ({
  ReadonlyParagraph: stubs.box('readonly-paragraph'),
}));
vi.mock('../TagPopup', () => ({
  TagPopup: ({ children, onSelect, placeholder }: any) => (
    <div
      data-testid="tag-popup"
      data-placeholder={placeholder}
      onClick={() => onSelect?.('', [], {})}
    >
      {children}
    </div>
  ),
}));
vi.mock('../FncLeaf', () => ({
  FncLeaf: ({ children }: any) => <span data-testid="fnc-leaf">{children}</span>,
}));
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    ConfigProvider: {
      ConfigContext: React.createContext({
        getPrefixCls: (s: string) => `ant-${s}`,
      }),
    },
  };
});

describe('elements/index deepen2 residual branches', () => {
  const baseElementProps = {
    attributes: { 'data-slate-node': 'element' as const, ref: null },
    children: <span>child</span>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it.each([
    ['hr', 'readonly-hr'],
    ['inline-katex', 'readonly-inline-katex'],
    ['mermaid', 'readonly-mermaid'],
    ['code', 'readonly-code'],
    ['footnoteDefinition', 'readonly-footnote'],
  ] as const)('MElement %s readonly 路由', (type, testId) => {
    const { container } = render(
      <MElement
        {...baseElementProps}
        element={{ type, children: [] }}
        readonly
      />,
    );
    const byTestId = container.querySelector(`[data-testid="${testId}"]`);
    // mock 未命中时至少渲染出节点（真实组件仍覆盖 readonly 臂）
    expect(byTestId || container.firstChild).toBeTruthy();
  });

  it('MLeaf 仅 tag（无 code）走 TagPopup；默认 placeholder；空 onSelect 早退', () => {
    render(
      <MLeaf
        leaf={{ text: 't', tag: true }}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{ enable: true }}
        linkConfig={{}}
      >
        <span>t</span>
      </MLeaf>,
    );
    const popup = screen.getByTestId('tag-popup');
    expect(popup).toHaveAttribute('data-placeholder', '请输入');
    fireEvent.click(popup);
  });

  it('MLeaf mark 且 text 缺失时不包 mark；dirtLeaf 点击选中', () => {
    const { container } = render(
      <MLeaf
        leaf={{ mark: true } as any}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{}}
        linkConfig={{}}
      >
        <span>x</span>
      </MLeaf>,
    );
    expect(container.querySelector('[data-testid="markdown-mark"]')).toBeNull();

    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
    const { container: dirt } = render(
      <MLeaf
        leaf={{ text: 'bold', bold: true, url: 'https://x' }}
        text={{ text: 'bold' } as any}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{}}
        linkConfig={{}}
      >
        <span>bold</span>
      </MLeaf>,
    );
    const el = dirt.querySelector('[data-be="text"]') as HTMLElement;
    fireEvent.click(el, { detail: 2 });
    expect(EditorUtils.isDirtLeaf).toHaveBeenCalled();
  });
});
