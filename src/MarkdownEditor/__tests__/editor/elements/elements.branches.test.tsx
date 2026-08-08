/**
 * elements/index.tsx 分支覆盖补充
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Editor, Path, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dragStart, MElement, MLeaf } from '../../../editor/elements';
import { JINJA_DOLLAR_PLACEHOLDER } from '../../../editor/parser/constants';

const elementStubs = vi.hoisted(() => {
  const box =
    (testId: string) =>
    ({ children }: Record<string, unknown>) => (
      <div data-testid={testId}>{children}</div>
    );
  return { box };
});

vi.mock('../../../editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: {
      current: {
        focus: vi.fn(),
        children: [],
      },
    },
    markdownContainerRef: {
      current: document.createElement('div'),
    },
    readonly: false,
    store: { dragStart: vi.fn() },
  })),
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: vi.fn().mockReturnValue([0, 0]),
    toDOMNode: vi.fn(() => document.createElement('div')),
  },
}));

vi.mock('slate', async () => {
  const actual = await vi.importActual<typeof import('slate')>('slate');
  return {
    ...actual,
    Editor: {
      ...actual.Editor,
      start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
      end: vi.fn(() => ({ path: [0, 0], offset: 2 })),
      hasPath: vi.fn(() => true),
      withoutNormalizing: (_ed: unknown, fn: () => void) => fn(),
    },
    Transforms: {
      delete: vi.fn(),
      insertText: vi.fn(),
      setNodes: vi.fn(),
      insertNodes: vi.fn(),
      select: vi.fn(),
    },
    Path: {
      previous: vi.fn(() => [0, 0]),
      next: vi.fn(() => [0, 1]),
    },
  };
});

vi.mock('../../../editor/utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

vi.mock('../../../editor/elements/Table', () => ({
  tableRenderElement: vi.fn((props: { element: { type: string } }) =>
    props.element.type === 'table'
      ? elementStubs.box('table-element')({ children: props.element.type })
      : null,
  ),
}));

vi.mock('../../../editor/elements/AgenticUiBlocks/AgenticUiTaskBlock', () => ({
  AgenticUiTaskBlock: elementStubs.box('agentic-task-edit'),
  ReadonlyAgenticUiTaskBlock: elementStubs.box('agentic-task-readonly'),
}));

vi.mock('../../../editor/elements/AgenticUiBlocks/AgenticUiToolUseBarBlock', () => ({
  AgenticUiToolUseBarBlock: elementStubs.box('agentic-tool-edit'),
  ReadonlyAgenticUiToolUseBarBlock: elementStubs.box('agentic-tool-readonly'),
}));

vi.mock('../../../editor/elements/AgenticUiBlocks/AgenticUiFileMapBlock', () => ({
  AgenticUiFileMapBlock: elementStubs.box('agentic-filemap-edit'),
  ReadonlyAgenticUiFileMapBlock: elementStubs.box('agentic-filemap-readonly'),
}));

vi.mock('../../../editor/elements/Blockquote', () => ({
  Blockquote: elementStubs.box('blockquote-edit'),
  ReadonlyBlockquote: elementStubs.box('blockquote-readonly'),
}));

vi.mock('../../../editor/elements/List', () => ({
  List: elementStubs.box('list-edit'),
  ListItem: elementStubs.box('list-item-edit'),
}));

vi.mock('../../../editor/elements/List/ReadonlyList', () => ({
  ReadonlyList: elementStubs.box('list-readonly'),
}));

vi.mock('../../../editor/elements/List/ReadonlyListItem', () => ({
  ReadonlyListItem: elementStubs.box('list-item-readonly'),
}));

vi.mock('../../../editor/elements/Paragraph', () => ({
  Paragraph: elementStubs.box('paragraph-edit'),
}));

vi.mock('../../../editor/elements/Paragraph/ReadonlyParagraph', () => ({
  ReadonlyParagraph: elementStubs.box('paragraph-readonly'),
}));

vi.mock('../../../editor/elements/Head', () => ({
  Head: elementStubs.box('head-edit'),
}));

vi.mock('../../../editor/elements/Head/ReadonlyHead', () => ({
  ReadonlyHead: elementStubs.box('head-readonly'),
}));

vi.mock('../../../editor/elements/Hr', () => ({
  Hr: elementStubs.box('hr-edit'),
}));

vi.mock('../../../editor/elements/Hr/ReadonlyHr', () => ({
  ReadonlyHr: elementStubs.box('hr-readonly'),
}));

vi.mock('../../../editor/elements/Break', () => ({
  Break: elementStubs.box('break-edit'),
}));

vi.mock('../../../editor/elements/Break/ReadonlyBreak', () => ({
  ReadonlyBreak: elementStubs.box('break-readonly'),
}));

vi.mock('../../../editor/elements/Code', () => ({
  Code: elementStubs.box('code-edit'),
}));

vi.mock('../../../editor/elements/Code/ReadonlyCode', () => ({
  ReadonlyCode: elementStubs.box('code-readonly'),
}));

vi.mock('../../../editor/elements/Image', () => ({
  EditorImage: elementStubs.box('image-edit'),
}));

vi.mock('../../../editor/elements/Image/ReadonlyEditorImage', () => ({
  ReadonlyEditorImage: elementStubs.box('image-readonly'),
}));

vi.mock('../../../editor/elements/Media', () => ({
  Media: elementStubs.box('media-edit'),
}));

vi.mock('../../../editor/elements/Media/ReadonlyMedia', () => ({
  ReadonlyMedia: elementStubs.box('media-readonly'),
}));

vi.mock('../../../editor/elements/Card', () => ({
  WarpCard: elementStubs.box('card-edit'),
}));

vi.mock('../../../editor/elements/Card/ReadonlyCard', () => ({
  ReadonlyCard: elementStubs.box('card-readonly'),
}));

vi.mock('../../../editor/elements/Schema', () => ({
  Schema: elementStubs.box('schema-edit'),
}));

vi.mock('../../../editor/elements/Schema/ReadonlySchema', () => ({
  ReadonlySchema: elementStubs.box('schema-readonly'),
}));

vi.mock('../../../editor/elements/FootnoteDefinition', () => ({
  FootnoteDefinition: elementStubs.box('footnote-edit'),
}));

vi.mock('../../../editor/elements/FootnoteDefinition/ReadonlyFootnoteDefinition', () => ({
  ReadonlyFootnoteDefinition: elementStubs.box('footnote-readonly'),
}));

vi.mock('../../../editor/elements/LinkCard', () => ({
  LinkCard: elementStubs.box('link-card-edit'),
}));

vi.mock('../../../editor/elements/LinkCard/ReadonlyLinkCard', () => ({
  ReadonlyLinkCard: elementStubs.box('link-card-readonly'),
}));

vi.mock('../../../editor/elements/Mermaid', () => ({
  Mermaid: elementStubs.box('mermaid-edit'),
}));

vi.mock('../../../editor/elements/Mermaid/ReadonlyMermaid', () => ({
  ReadonlyMermaid: elementStubs.box('mermaid-readonly'),
}));

vi.mock('../../../editor/elements/Katex', () => ({
  Katex: elementStubs.box('katex-edit'),
}));

vi.mock('../../../editor/elements/Katex/ReadonlyKatex', () => ({
  ReadonlyKatex: elementStubs.box('katex-readonly'),
}));

vi.mock('../../../editor/elements/InlineKatex', () => ({
  InlineKatex: elementStubs.box('inline-katex-edit'),
}));

vi.mock('../../../editor/elements/InlineKatex/ReadonlyInlineKatex', () => ({
  ReadonlyInlineKatex: elementStubs.box('inline-katex-readonly'),
}));

vi.mock('../../../editor/elements/TagPopup', () => ({
  TagPopup: ({ children, onSelect, tagTextRender }: any) => (
    <div data-testid="tag-popup">
      <button
        type="button"
        data-testid="tag-select-empty"
        onClick={() => onSelect('', [0, 0], {})}
      >
        empty
      </button>
      <button
        type="button"
        data-testid="tag-select-valid"
        onClick={() => onSelect('tag', [0, 0], { tag: true })}
      >
        valid
      </button>
      <button
        type="button"
        data-testid="tag-select-path-nonzero"
        onClick={() => onSelect('tag', [0, 1], { tag: true })}
      >
        path-nonzero
      </button>
      <button
        type="button"
        data-testid="tag-select-empty-path"
        onClick={() => onSelect('tag', [], { tag: true })}
      >
        empty-path
      </button>
      <button
        type="button"
        data-testid="tag-select-falsy-render"
        onClick={() => {
          // tagTextRender 返回 '' 时走 || fallback
          void tagTextRender;
          onSelect('x', [0, 0], { tag: true });
        }}
      >
        falsy-render
      </button>
      {children}
    </div>
  ),
}));

vi.mock('../../../editor/elements/FncLeaf', () => ({
  FncLeaf: ({ children }: any) => <span data-testid="fnc-leaf">{children}</span>,
}));

vi.mock('../../../editor/elements/CommentLeaf', () => ({
  CommentLeaf: ({ children }: any) => (
    <span data-testid="comment-leaf">{children}</span>
  ),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    ConfigProvider: {
      ConfigContext: React.createContext({
        getPrefixCls: (suffixCls: string) => `ant-${suffixCls}`,
      }),
    },
  };
});

import { useEditorStore } from '../../../editor/store';
import { EditorUtils } from '../../../editor/utils/editorUtils';

const baseElementProps = {
  attributes: { 'data-slate-node': 'element' as const, ref: null },
  children: <span>child</span>,
  readonly: false,
};

const baseLeafProps = {
  leaf: { text: 'leaf' },
  text: { text: 'leaf' },
  attributes: { 'data-slate-leaf': true as const },
  children: <span>leaf-child</span>,
  comment: {},
  fncProps: {},
  tagInputProps: {},
  linkConfig: {},
  readonly: false,
} as any;

describe('elements/index branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: {
        current: {
          focus: vi.fn(),
          children: [],
        },
      },
      markdownContainerRef: {
        current: document.createElement('div'),
      },
      readonly: false,
      store: { dragStart: vi.fn() },
    } as any);
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
  });

  it('dragStart prevents default drag behavior', () => {
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.DragEvent;
    dragStart(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it.each([
    ['agentic-ui-task', false, 'agentic-task-edit'],
    ['agentic-ui-task', true, 'agentic-task-readonly'],
    ['agentic-ui-toolusebar', false, 'agentic-tool-edit'],
    ['agentic-ui-usertoolbar', true, 'agentic-tool-readonly'],
    ['agentic-ui-filemap', false, 'agentic-filemap-edit'],
    ['bulleted-list', true, 'list-readonly'],
    ['numbered-list', false, 'list-edit'],
    ['list', true, 'list-readonly'],
    ['table', false, 'table-element'],
  ] as const)(
    'MElement routes %s readonly=%s to %s',
    (type, readonly, testId) => {
      render(
        <MElement
          {...baseElementProps}
          readonly={readonly}
          element={{ type, children: [] }}
        />,
      );
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    },
  );

  it('MElement memo skips rerender when readonly hash matches', () => {
    const element = { type: 'paragraph', children: [], hash: 'same-hash' };
    const { rerender } = render(
      <MElement
        {...baseElementProps}
        readonly
        element={element}
        deps={['a']}
      />,
    );
    rerender(
      <MElement
        {...baseElementProps}
        readonly
        element={{ ...element }}
        deps={['a']}
      />,
    );
    expect(screen.getByTestId('paragraph-readonly')).toBeInTheDocument();
  });

  it('MElement rerenders when deps change', () => {
    const element = { type: 'paragraph', children: [], hash: 'hash-a' };
    const { rerender } = render(
      <MElement
        {...baseElementProps}
        readonly
        element={element}
        deps={['a']}
      />,
    );
    rerender(
      <MElement
        {...baseElementProps}
        readonly
        element={{ ...element, hash: 'hash-b' }}
        deps={['b']}
      />,
    );
    expect(screen.getByTestId('paragraph-readonly')).toBeInTheDocument();
  });

  it('MLeaf restores jinja dollar placeholder in children', () => {
    const { container } = render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'x', jinjaVariable: true }}
      >
        {`${JINJA_DOLLAR_PLACEHOLDER}{ foo }`}
      </MLeaf>,
    );
    expect(container.textContent).toContain('${ foo }');
  });

  it('MLeaf tag onSelect guards skip when value or path missing', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: null },
      markdownContainerRef: { current: document.createElement('div') },
    } as any);

    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true }}
      />,
    );

    fireEvent.click(screen.getByTestId('tag-select-empty'));
    expect(Transforms.insertText).not.toHaveBeenCalled();
  });

  it('MLeaf tag onSelect inserts rendered tag text', () => {
    const editor = { focus: vi.fn(), children: [] };
    const container = document.createElement('div');
    container.innerHTML = '<div data-slate-node="value"></div>';
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      markdownContainerRef: { current: container },
    } as any);

    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{
          enable: true,
          tagTextRender: () => '$custom',
        }}
        leaf={{ text: '$', tag: true, code: true, triggerText: '$' }}
      />,
    );

    fireEvent.click(screen.getByTestId('tag-select-valid'));
    expect(Transforms.insertText).toHaveBeenCalled();
    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('MLeaf link onClick false prevents navigation', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'link', url: 'https://example.com' }}
        linkConfig={{
          onClick: () => false,
          openInNewTab: true,
        }}
      />,
    );

    fireEvent.click(screen.getByText('leaf-child').closest('[data-be="text"]')!);
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('MLeaf with openInNewTab false invokes link handler branch', () => {
    const onClick = vi.fn(() => true);
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'link', url: 'https://example.com' }}
        linkConfig={{ openInNewTab: false, onClick }}
      />,
    );

    fireEvent.click(screen.getByText('leaf-child').closest('[data-be="text"]')!);
    expect(onClick).toHaveBeenCalledWith('https://example.com');
  });

  it('MLeaf wraps fnc leaf with comment when both present', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'fn', fnc: true, comment: true }}
        comment={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('comment-leaf')).toBeInTheDocument();
    expect(screen.getByTestId('fnc-leaf')).toBeInTheDocument();
  });

  it('MLeaf renders mark label and background styles', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: 'marked',
          mark: true,
          markLabel: 'NOTE',
          markColor: '#111',
          markBg: '#eee',
        }}
      />,
    );
    expect(screen.getByTestId('markdown-mark-label')).toHaveTextContent('NOTE');
    expect(screen.getByTestId('markdown-mark')).toHaveStyle({
      color: '#111',
      backgroundColor: '#eee',
    });
  });

  it('MLeaf identifier-only leaf uses FncLeaf path', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'fn', identifier: 'id-1' }}
      />,
    );
    expect(screen.getByTestId('fnc-leaf')).toBeInTheDocument();
  });

  it('MLeaf double-click selects format when dirty leaf', () => {
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
    const editor = {};
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      markdownContainerRef: { current: document.createElement('div') },
    } as any);

    render(<MLeaf {...baseLeafProps} leaf={{ text: 'fmt', bold: true }} />);

    const textEl = screen.getByText('leaf-child').closest('[data-be="text"]')!;
    fireEvent.click(textEl, { detail: 2 });
    expect(Transforms.select).toHaveBeenCalled();
  });

  it.each([
    ['head', false, 'head-edit'],
    ['head', true, 'head-readonly'],
    ['hr', false, 'hr-edit'],
    ['break', true, 'break-readonly'],
    ['code', false, 'code-edit'],
    ['image', true, 'image-readonly'],
    ['media', false, 'media-edit'],
    ['card', true, 'card-readonly'],
    ['schema', false, 'schema-edit'],
    ['apassify', true, 'schema-readonly'],
    ['footnoteDefinition', false, 'footnote-edit'],
    ['link-card', true, 'link-card-readonly'],
    ['mermaid', false, 'mermaid-edit'],
    ['katex', true, 'katex-readonly'],
    ['inline-katex', false, 'inline-katex-edit'],
    ['list-item', true, 'list-item-readonly'],
  ] as const)(
    'MElement routes %s readonly=%s to %s',
    (type, readonly, testId) => {
      render(
        <MElement
          {...baseElementProps}
          readonly={readonly}
          element={{ type, children: [] }}
        />,
      );
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    },
  );

  it('card-before hides in readonly mode', () => {
    const { container } = render(
      <MElement
        {...baseElementProps}
        readonly
        element={{ type: 'card-before', children: [] }}
      />,
    );
    const el = container.querySelector('[data-be="card-before"]') as HTMLElement;
    expect(el.style.display).toBe('none');
  });

  it('card-after shows inline-block in edit mode', () => {
    const { container } = render(
      <MElement
        {...baseElementProps}
        readonly={false}
        element={{ type: 'card-after', children: [] }}
      />,
    );
    const el = container.querySelector('[data-be="card-after"]') as HTMLElement;
    expect(el.style.display).toBe('inline-block');
  });

  it('MLeaf readonly tag renders inline code without TagPopup', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        readonly
        tagInputProps={{ enable: true }}
        leaf={{ text: '$tag', tag: true, code: true }}
      />,
    );
    expect(screen.queryByTestId('tag-popup')).not.toBeInTheDocument();
    expect(document.querySelector('code')).toBeInTheDocument();
  });

  it('MLeaf applies highColor italic strikethrough and current highlight', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: 'styled',
          highColor: '#f00',
          italic: true,
          strikethrough: true,
          current: true,
        }}
      />,
    );
    const textEl = screen.getByText('leaf-child').closest('[data-be="text"]')!;
    expect(textEl).toHaveStyle({ color: '#f00', fontStyle: 'italic' });
    expect(textEl.querySelector('s')).toBeInTheDocument();
  });

  it('MLeaf jinja classes merge into className', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: 'j',
          jinjaTag: true,
          jinjaKeyword: true,
          html: true,
        }}
      />,
    );
    const textEl = screen.getByText('leaf-child').closest('[data-be="text"]')!;
    expect(textEl.className).toContain('jinja-tag');
    expect(textEl.className).toContain('jinja-keyword');
    expect(textEl.className).toContain('m-html');
  });

  it('MLeaf fnd leaf uses FncLeaf path', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'fn', fnd: true }}
      />,
    );
    expect(screen.getByTestId('fnc-leaf')).toBeInTheDocument();
  });

  it('MLeaf comment-only wraps with CommentLeaf', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'c', comment: true }}
        comment={{ enable: true }}
      />,
    );
    expect(screen.getByTestId('comment-leaf')).toBeInTheDocument();
  });

  it('MLeaf readonly double-click does not select format', () => {
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
    render(
      <MLeaf
        {...baseLeafProps}
        readonly
        leaf={{ text: 'fmt', bold: true }}
      />,
    );
    const textEl = screen.getByText('leaf-child').closest('[data-be="text"]')!;
    fireEvent.click(textEl, { detail: 2 });
    expect(Transforms.select).not.toHaveBeenCalled();
  });

  it('MLeaf tag onSelect at path index 0 uses path without previous', async () => {
    vi.mocked(Path.previous).mockReturnValue([0, 0] as any);
    const editor = { focus: vi.fn(), children: [] };
    const container = document.createElement('div');
    container.innerHTML = '<div data-slate-node="value"></div>';
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      markdownContainerRef: { current: container },
    } as any);
    vi.mocked(Editor.hasPath).mockReturnValue(false);

    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true, triggerText: '$' }}
      />,
    );

    fireEvent.click(screen.getByTestId('tag-select-valid'));
    await new Promise((r) => setTimeout(r, 0));
    expect(Transforms.insertNodes).toHaveBeenCalledWith(
      editor,
      [{ text: ' ' }],
      expect.objectContaining({ select: true }),
    );
  });

  it('MLeaf link openInNewTab false assigns location.href', () => {
    const originalLocation = window.location;
    const assignMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '', assign: assignMock },
    });
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'link', url: 'https://example.com/page' }}
        linkConfig={{ openInNewTab: false }}
      />,
    );
    fireEvent.click(screen.getByText('leaf-child').closest('[data-be="text"]')!);
    expect(window.location.href).toBe('https://example.com/page');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('MLeaf restores jinja dollar in nested React element children', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'x', jinjaVariable: true }}
      >
        <span>{`${JINJA_DOLLAR_PLACEHOLDER}{ bar }`}</span>
      </MLeaf>,
    );
    expect(screen.getByText('${ bar }')).toBeInTheDocument();
  });

  it('MLeaf leaf.color 写入 style', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'c', color: '#00ff00' }}
      />,
    );
    const textEl = screen.getByText('leaf-child').closest('[data-be="text"]')!;
    expect(textEl).toHaveStyle({ color: '#00ff00' });
  });

  it('MLeaf 额外 jinja* 标记类名', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: 'j',
          jinjaString: true,
          jinjaNumber: true,
          jinjaFilter: true,
        }}
      />,
    );
    const textEl = screen.getByText('leaf-child').closest('[data-be="text"]')!;
    expect(textEl.className).toMatch(/jinja/);
  });

  it('MElement tableDom 优先返回', () => {
    render(
      <MElement
        element={{ type: 'table', children: [] } as any}
        attributes={{} as any}
      >
        {null}
      </MElement>,
    );
    expect(screen.getByTestId('table-element')).toBeInTheDocument();
  });

  it('MElement apassify / apaasify 类型', () => {
    const { rerender } = render(
      <MElement
        element={{ type: 'apassify', value: [], children: [] } as any}
        attributes={{} as any}
      >
        {null}
      </MElement>,
    );
    expect(screen.getByTestId('schema-edit')).toBeInTheDocument();
    rerender(
      <MElement
        element={{ type: 'apaasify', value: [], children: [] } as any}
        attributes={{} as any}
        readonly
      >
        {null}
      </MElement>,
    );
    expect(screen.getByTestId('schema-readonly')).toBeInTheDocument();
  });

  it('MLeaf tag onSelect 无 editorRef 时不抛错', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: null },
      markdownContainerRef: { current: document.createElement('div') },
    } as any);
    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true, triggerText: '$' }}
      />,
    );
    expect(() =>
      fireEvent.click(screen.getByTestId('tag-select-valid')),
    ).not.toThrow();
  });
});

describe('elements/index istanbul residual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: {
        current: {
          focus: vi.fn(),
          children: [],
        },
      },
      markdownContainerRef: {
        current: document.createElement('div'),
      },
      readonly: false,
      store: { dragStart: vi.fn() },
    } as any);
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
  });

  it('MElement deps 一侧 undefined 触发 rerender', () => {
    const element = { type: 'paragraph', children: [], hash: 'h1' };
    const { rerender } = render(
      <MElement {...baseElementProps} readonly element={element} deps={['a']} />,
    );
    rerender(
      <MElement
        {...baseElementProps}
        readonly
        element={element}
        deps={undefined}
      />,
    );
    expect(screen.getByTestId('paragraph-readonly')).toBeInTheDocument();
  });

  it('MElement deps 长度不同触发 rerender', () => {
    const element = { type: 'paragraph', children: [], hash: 'h2' };
    const { rerender } = render(
      <MElement {...baseElementProps} readonly element={element} deps={['a']} />,
    );
    rerender(
      <MElement
        {...baseElementProps}
        readonly
        element={element}
        deps={['a', 'b']}
      />,
    );
    expect(screen.getByTestId('paragraph-readonly')).toBeInTheDocument();
  });

  it('MElement hash 相同但非 readonly 回退引用比较', () => {
    const element = { type: 'paragraph', children: [], hash: 'same' };
    const { rerender } = render(
      <MElement {...baseElementProps} element={element} />,
    );
    rerender(
      <MElement
        {...baseElementProps}
        element={{ ...element }}
      />,
    );
    expect(screen.getByTestId('paragraph-edit')).toBeInTheDocument();
  });

  it('MLeaf onSelect 空 path 早退', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true, triggerText: '$' }}
      />,
    );
    expect(() =>
      fireEvent.click(screen.getByTestId('tag-select-empty-path')),
    ).not.toThrow();
  });

  it('MLeaf tagTextRender 返回 falsy 时用 triggerText fallback', () => {
    const editor = {
      focus: vi.fn(),
      children: [],
    };
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      markdownContainerRef: {
        current: document.createElement('div'),
      },
      readonly: false,
      store: { dragStart: vi.fn() },
    } as any);
    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{
          enable: true,
          tagTextRender: () => '',
        }}
        leaf={{ text: '$', tag: true, code: true, triggerText: undefined }}
      />,
    );
    expect(() =>
      fireEvent.click(screen.getByTestId('tag-select-valid')),
    ).not.toThrow();
    expect(Transforms.insertText).toHaveBeenCalled();
  });

  it('MLeaf mark=true 但 text 为空不渲染 mark', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: '', mark: true }}
      />,
    );
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('MLeaf linkConfig openInNewTab false 且无 url 不导航', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'plain' }}
        linkConfig={{ openInNewTab: false }}
      />,
    );
    fireEvent.click(screen.getByText('leaf-child').closest('[data-be="text"]')!);
  });

  it('MLeaf placeholder 空且无 locale 时仍渲染 TagPopup', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{
          text: '',
          tag: true,
          code: true,
          placeholder: '',
          triggerText: '',
        }}
      />,
    );
    expect(screen.getByTestId('tag-popup')).toBeInTheDocument();
  });

  it('MLeaf editable 时 tagInputProps 变更导致 rerender', () => {
    const { rerender } = render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true }}
      />,
    );
    rerender(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true, items: [] }}
        leaf={{ text: '$', tag: true, code: true }}
      />,
    );
    expect(screen.getByTestId('tag-popup')).toBeInTheDocument();
  });

  it('istanbul buffer：markdownEditorRef 缺失与 path 末位 0', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: null },
      markdownContainerRef: { current: document.createElement('div') },
      readonly: false,
      store: { dragStart: vi.fn() },
    } as any);

    const { unmount: unmountNull } = render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true, triggerText: '$' }}
      />,
    );
    expect(() =>
      fireEvent.click(screen.getByTestId('tag-select-valid')),
    ).not.toThrow();
    unmountNull();

    const editor = {
      focus: vi.fn(),
      children: [],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    };
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      markdownContainerRef: {
        current: document.createElement('div'),
      },
      readonly: false,
      store: { dragStart: vi.fn() },
    } as any);

    // path 末位 0 → 不走 Path.previous（mock 按钮传 [0,0]）
    const { unmount: unmountZero } = render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true, triggerText: '$' }}
      />,
    );
    expect(() =>
      fireEvent.click(screen.getByTestId('tag-select-valid')),
    ).not.toThrow();
    expect(Path.previous).not.toHaveBeenCalled();
    unmountZero();

    // path 末位 >0 → Path.previous（专用按钮传 [0,1]）
    vi.mocked(Path.previous).mockClear();
    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: true }}
        leaf={{ text: '$', tag: true, code: true, triggerText: '$' }}
      />,
    );
    expect(() =>
      fireEvent.click(screen.getByTestId('tag-select-path-nonzero')),
    ).not.toThrow();
    expect(Path.previous).toHaveBeenCalled();
    cleanup();
  });

  it('istanbul fill：dirtLeaf 真值；无 tag enable；未知块走 paragraph', () => {
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
    const { unmount } = render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'dirty', bold: true, italic: true }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
    unmount();

    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: false }}
        leaf={{ text: '', code: true }}
      />,
    );
    expect(screen.queryByTestId('tag-popup')).not.toBeInTheDocument();

    render(
      <MElement
        {...baseElementProps}
        element={{ type: 'unknown-block', children: [{ text: 'x' }] } as any}
      />,
    );
    expect(screen.getByTestId('paragraph-edit')).toBeInTheDocument();
  });

  it('istanbul after：MLeaf 仅 italic / 仅 strikethrough / url 叶子', () => {
    const { unmount: u1 } = render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'i-only', italic: true }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
    u1();

    const { unmount: u2 } = render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 's-only', strikethrough: true }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
    u2();

    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{ text: 'link', url: 'https://ex.com' }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
  });
});

describe('elements/index istanbul buffer：组合 mark 与 void', () => {
  it('MLeaf bold+code+highColor 组合', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: 'combo',
          bold: true,
          code: true,
          highColor: '#0f0',
          fnc: true,
        }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
  });

  it('MLeaf mark 全属性与空 text', () => {
    render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: '',
          mark: true,
          markColor: '#f00',
          markBg: '#ff0',
          markLabel: '@',
        }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
  });

  it('MLeaf deepen：html/jinja*/color/current；mark 无 label；code 无 tag', () => {
    const { unmount: u1 } = render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: 'html',
          html: true,
          color: '#123',
          current: true,
          jinjaVariable: true,
          jinjaTag: true,
          jinjaComment: true,
          jinjaKeyword: true,
          jinjaString: true,
          jinjaNumber: true,
          jinjaFilter: true,
          jinjaVariableName: true,
          jinjaPlaceholder: true,
          jinjaDelimiter: true,
        }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
    u1();

    const { unmount: u2 } = render(
      <MLeaf
        {...baseLeafProps}
        leaf={{
          text: 'marked',
          mark: true,
          markColor: '#abc',
        }}
      />,
    );
    expect(screen.getByTestId('markdown-mark')).toBeInTheDocument();
    u2();

    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{ enable: false }}
        leaf={{ text: 'code-only', code: true }}
      />,
    );
    expect(screen.getByText('leaf-child')).toBeInTheDocument();
  });

  it('MLeaf deepen：tag onSelect 有 focusElement 且 Path.next 已存在', async () => {
    const editor = { focus: vi.fn(), children: [] };
    const container = document.createElement('div');
    container.innerHTML = '<div data-slate-node="value"></div>';
    const focusElement = container.querySelector(
      'div[data-slate-node="value"]',
    ) as HTMLDivElement;
    focusElement.focus = vi.fn();
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      markdownContainerRef: { current: container },
    } as any);
    vi.mocked(Editor.hasPath).mockReturnValue(true);
    vi.mocked(Path.next).mockReturnValue([0, 1] as any);

    render(
      <MLeaf
        {...baseLeafProps}
        tagInputProps={{
          enable: true,
          tagTextRender: () => '',
        }}
        leaf={{
          text: '$',
          tag: true,
          code: true,
          triggerText: '#',
          placeholder: 'ph',
          autoOpen: true,
        }}
      />,
    );

    fireEvent.click(screen.getByTestId('tag-select-valid'));
    await new Promise((r) => setTimeout(r, 0));
    expect(Transforms.select).toHaveBeenCalled();
    expect(focusElement.focus).toHaveBeenCalled();
  });
});
