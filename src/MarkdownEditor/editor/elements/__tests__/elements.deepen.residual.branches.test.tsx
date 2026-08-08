/**
 * elements/index deepen residual：table 分支、agentic 路由、jinja/mark、restoreJinjaDollar。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JINJA_DOLLAR_PLACEHOLDER } from '../../parser/constants';
import { MElement, MLeaf } from '../index';

const stubs = vi.hoisted(() => {
  const box =
    (testId: string) =>
    ({ children, ...rest }: Record<string, unknown>) => (
      <div data-testid={testId} {...rest}>
        {children}
      </div>
    );
  return { box };
});

vi.mock('../../store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: { current: { focus: vi.fn() } },
    markdownContainerRef: {
      current: {
        querySelector: vi.fn(() => document.createElement('div')),
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
  tableRenderElement: vi.fn((props: any) =>
    props.element?.type === 'table' ? (
      <div data-testid="table-branch">{props.children}</div>
    ) : null,
  ),
}));

vi.mock('../AgenticUiBlocks/AgenticUiTaskBlock', () => ({
  AgenticUiTaskBlock: stubs.box('agentic-task'),
  ReadonlyAgenticUiTaskBlock: stubs.box('readonly-agentic-task'),
}));

vi.mock('../AgenticUiBlocks/AgenticUiToolUseBarBlock', () => ({
  AgenticUiToolUseBarBlock: stubs.box('agentic-tool'),
  ReadonlyAgenticUiToolUseBarBlock: stubs.box('readonly-agentic-tool'),
}));

vi.mock('../AgenticUiBlocks/AgenticUiFileMapBlock', () => ({
  AgenticUiFileMapBlock: stubs.box('agentic-filemap'),
  ReadonlyAgenticUiFileMapBlock: stubs.box('readonly-agentic-filemap'),
}));

vi.mock('../Paragraph', () => ({
  Paragraph: stubs.box('paragraph'),
}));

vi.mock('../Paragraph/ReadonlyParagraph', () => ({
  ReadonlyParagraph: stubs.box('readonly-paragraph'),
}));

vi.mock('../List', () => ({
  List: stubs.box('list'),
  ListItem: stubs.box('list-item'),
}));

vi.mock('../List/ReadonlyList', () => ({
  ReadonlyList: stubs.box('readonly-list'),
}));

vi.mock('../List/ReadonlyListItem', () => ({
  ReadonlyListItem: stubs.box('readonly-list-item'),
}));

vi.mock('../TagPopup', () => ({
  TagPopup: ({ children, onSelect }: any) => (
    <div
      data-testid="tag-popup"
      onClick={() => onSelect?.('', [], {})}
    >
      {children}
    </div>
  ),
}));

vi.mock('../FncLeaf', () => ({
  FncLeaf: ({ children }: any) => <span data-testid="fnc-leaf">{children}</span>,
}));

vi.mock('../CommentLeaf', () => ({
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
        getPrefixCls: (s: string) => `ant-${s}`,
      }),
    },
  };
});

describe('elements/index deepen residual branches', () => {
  const baseElementProps = {
    attributes: { 'data-slate-node': 'element' as const, ref: null },
    children: <span>child</span>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tableRenderElement 命中时优先返回 table 分支', () => {
    render(
      <MElement
        {...baseElementProps}
        element={{ type: 'table', children: [] }}
      />,
    );
    expect(screen.getByTestId('table-branch')).toBeInTheDocument();
  });

  it.each([
    ['agentic-ui-task', 'agentic-task', 'readonly-agentic-task'],
    ['agentic-ui-toolusebar', 'agentic-tool', 'readonly-agentic-tool'],
    ['agentic-ui-usertoolbar', 'agentic-tool', 'readonly-agentic-tool'],
    ['agentic-ui-filemap', 'agentic-filemap', 'readonly-agentic-filemap'],
    ['numbered-list', 'list', 'readonly-list'],
    ['bulleted-list', 'list', 'readonly-list'],
  ] as const)(
    'MElement %s 编辑/只读路由',
    (type, editId, roId) => {
      const el = { type, children: [] };
      const { unmount } = render(
        <MElement {...baseElementProps} element={el} readonly={false} />,
      );
      expect(screen.getByTestId(editId)).toBeInTheDocument();
      unmount();
      render(<MElement {...baseElementProps} element={el} readonly />);
      expect(screen.getByTestId(roId)).toBeInTheDocument();
    },
  );

  it('MElement hash+readonly memo：同 hash 不强制重渲染', () => {
    const el = { type: 'paragraph', hash: 'h1', children: [] };
    const { rerender } = render(
      <MElement {...baseElementProps} element={el} readonly deps={['a']} />,
    );
    rerender(
      <MElement
        {...baseElementProps}
        element={{ ...el }}
        readonly
        deps={['a']}
      />,
    );
    expect(screen.getByTestId('readonly-paragraph')).toBeInTheDocument();
  });

  it('MLeaf mark 无 color/bg/label；jinja 类名矩阵', () => {
    render(
      <MLeaf
        leaf={{ text: 'm', mark: true }}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{}}
        linkConfig={{}}
      >
        <span>m</span>
      </MLeaf>,
    );
    expect(screen.getByTestId('markdown-mark')).toBeInTheDocument();

    const jinjaFlags = [
      'jinjaVariable',
      'jinjaTag',
      'jinjaComment',
      'jinjaKeyword',
      'jinjaString',
      'jinjaNumber',
      'jinjaFilter',
      'jinjaVariableName',
    ] as const;
    for (const key of jinjaFlags) {
      const { container, unmount } = render(
        <MLeaf
          leaf={{ text: 'j', [key]: true }}
          attributes={{ 'data-slate-leaf': true }}
          comment={undefined}
          fncProps={{}}
          tagInputProps={{}}
          linkConfig={{}}
        >
          <span>j</span>
        </MLeaf>,
      );
      expect(container.querySelector('[data-be="text"]')?.className).toContain(
        'jinja',
      );
      unmount();
    }
  });

  it('restoreJinjaDollar：占位符渲染为 $', () => {
    render(
      <MLeaf
        leaf={{ text: `${JINJA_DOLLAR_PLACEHOLDER}{ x }` }}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{}}
        linkConfig={{}}
      >
        <span>{`${JINJA_DOLLAR_PLACEHOLDER}{ x }`}</span>
      </MLeaf>,
    );
    expect(screen.getByText('${ x }')).toBeInTheDocument();
  });

  it('TagPopup onSelect 空值早退；fnc+comment 包裹', () => {
    render(
      <MLeaf
        leaf={{ text: 't', tag: true, code: true }}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{ enable: true }}
        linkConfig={{}}
      >
        <span>t</span>
      </MLeaf>,
    );
    fireEvent.click(screen.getByTestId('tag-popup'));

    render(
      <MLeaf
        leaf={{ text: 't', fnc: true, comment: true }}
        attributes={{ 'data-slate-leaf': true }}
        comment={{ enable: true }}
        fncProps={{}}
        tagInputProps={{}}
        linkConfig={{}}
      >
        <span>t</span>
      </MLeaf>,
    );
    expect(screen.getByTestId('comment-leaf')).toBeInTheDocument();
  });
});
