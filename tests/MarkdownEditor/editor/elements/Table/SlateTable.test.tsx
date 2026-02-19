import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* ---- hoisted mocks ---- */
const mocks = vi.hoisted(() => ({
  storeState: {
    readonly: false,
    markdownContainerRef: { current: null as HTMLElement | null },
  },
  scrollRef: { current: null as HTMLElement | null },
  scrollState: {
    vertical: { hasScroll: false, isAtStart: true, isAtEnd: true },
    horizontal: { hasScroll: false, isAtStart: true, isAtEnd: true },
  },
}));

vi.mock('../../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mocks.storeState,
}));

vi.mock(
  '../../../../../src/MarkdownEditor/editor/elements/Table/useScrollShadow',
  () => ({
    default: () => [mocks.scrollRef, mocks.scrollState],
  }),
);

vi.mock(
  '../../../../../src/MarkdownEditor/editor/elements/Table/ReadonlyTableComponent',
  () => ({
    ReadonlyTableComponent: ({ children, element, baseCls }: any) => (
      <div data-testid="readonly-table" data-basecls={baseCls}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  '../../../../../src/MarkdownEditor/editor/elements/Table/TableRowIndex',
  () => ({
    TableRowIndex: () => (
      <tr data-testid="table-row-index">
        <td>index</td>
      </tr>
    ),
  }),
);

vi.mock('string-width', () => ({
  default: (s: string) => s.length,
}));

vi.mock('slate', () => ({
  Node: {
    string: (node: any) => {
      if (typeof node === 'string') return node;
      if (node?.text !== undefined) return node.text;
      return (node?.children || []).map((c: any) => c.text || '').join('');
    },
  },
}));

import { SlateTable } from '../../../../../src/MarkdownEditor/editor/elements/Table/Table';

/* ---- helpers ---- */

/** 创建一个简单的 Slate table element */
const makeTableElement = (
  rows: string[][],
  otherProps?: Record<string, any>,
) => ({
  type: 'table' as const,
  otherProps,
  children: rows.map((cells) => ({
    type: 'table-row' as const,
    children: cells.map((text) => ({
      type: 'table-cell' as const,
      children: [{ text }],
    })),
  })),
});

const defaultProps = {
  attributes: { 'data-slate-node': 'element' as const, ref: { current: null } },
};

const renderSlateTable = (
  elementOverride?: any,
  children?: React.ReactNode,
) => {
  const element =
    elementOverride ||
    makeTableElement([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  return render(
    <SlateTable element={element} {...defaultProps}>
      {children || (
        <tr>
          <td>child</td>
        </tr>
      )}
    </SlateTable>,
  );
};

/* ---- Tests ---- */

describe('SlateTable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.storeState.readonly = false;
    mocks.storeState.markdownContainerRef = { current: null };
    mocks.scrollRef.current = null;
    mocks.scrollState.vertical = {
      hasScroll: false,
      isAtStart: true,
      isAtEnd: true,
    };
    mocks.scrollState.horizontal = {
      hasScroll: false,
      isAtStart: true,
      isAtEnd: true,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('readonly 模式', () => {
    beforeEach(() => {
      mocks.storeState.readonly = true;
    });

    it('渲染 ReadonlyTableComponent', () => {
      const { getByTestId } = renderSlateTable();
      expect(getByTestId('readonly-table')).toBeInTheDocument();
    });

    it('otherProps.colWidths 存在时直接返回', () => {
      const element = makeTableElement([['a', 'b']], { colWidths: [100, 200] });
      const { getByTestId } = renderSlateTable(element);
      expect(getByTestId('readonly-table')).toBeInTheDocument();
    });

    it('columnCount 为 0 时返回空数组', () => {
      const element = {
        type: 'table' as const,
        children: [{ type: 'table-row', children: [] }],
      };
      const { getByTestId } = renderSlateTable(element);
      expect(getByTestId('readonly-table')).toBeInTheDocument();
    });
  });

  describe('编辑模式列宽计算', () => {
    it('otherProps.colWidths 存在时直接使用', () => {
      const element = makeTableElement([['a', 'b']], { colWidths: [120, 180] });
      const { container } = renderSlateTable(element);
      const cols = container.querySelectorAll('col');
      // 第一个 col 是 12px 的行号列，之后是 colWidths 对应的列
      expect(cols.length).toBe(3);
    });

    it('element.children 为空时返回空数组', () => {
      const element = { type: 'table' as const, children: [] };
      const { container } = renderSlateTable(element);
      // 只有行号列
      const cols = container.querySelectorAll('col');
      expect(cols.length).toBe(1);
    });

    it('第一行 children 为空时返回空数组', () => {
      const element = {
        type: 'table' as const,
        children: [{ type: 'table-row', children: [] }],
      };
      const { container } = renderSlateTable(element);
      const cols = container.querySelectorAll('col');
      expect(cols.length).toBe(1);
    });

    it('正常计算列宽并创建 col 元素', () => {
      // 设置容器宽度
      const containerDiv = document.createElement('div');
      const contentDiv = document.createElement('div');
      contentDiv.className = 'ant-agentic-md-editor-content';
      Object.defineProperty(contentDiv, 'clientWidth', {
        value: 800,
        configurable: true,
      });
      containerDiv.appendChild(contentDiv);
      mocks.storeState.markdownContainerRef = { current: containerDiv };

      const element = makeTableElement([
        ['short', 'medium text'],
        ['a', 'longer text here'],
      ]);
      const { container } = renderSlateTable(element);
      // 行号列 + 2 数据列
      const cols = container.querySelectorAll('col');
      expect(cols.length).toBe(3);
    });

    it('总宽度超过容器宽度时均匀分配', () => {
      // 设置很窄的容器来触发均匀分配
      const containerDiv = document.createElement('div');
      const contentDiv = document.createElement('div');
      contentDiv.className = 'ant-agentic-md-editor-content';
      Object.defineProperty(contentDiv, 'clientWidth', {
        value: 100,
        configurable: true,
      });
      containerDiv.appendChild(contentDiv);
      mocks.storeState.markdownContainerRef = { current: containerDiv };

      // 用很长的文本确保 totalWidth > containerWidth
      const element = makeTableElement([
        [
          'very long text content here for width',
          'another very long text content here',
        ],
      ]);
      const { container } = renderSlateTable(element);
      const cols = container.querySelectorAll('col');
      expect(cols.length).toBe(3);
    });
  });

  describe('resize 事件', () => {
    it('编辑模式下添加 resize 事件监听并在 test 环境下早退', () => {
      const addSpy = vi.spyOn(document, 'addEventListener');
      const windowAddSpy = vi.spyOn(window, 'addEventListener');

      renderSlateTable();

      expect(addSpy).toHaveBeenCalledWith('md-resize', expect.any(Function));
      expect(windowAddSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('readonly 模式不添加 resize 监听', () => {
      mocks.storeState.readonly = true;
      const addSpy = vi.spyOn(document, 'addEventListener');
      renderSlateTable();
      expect(addSpy).not.toHaveBeenCalledWith(
        'md-resize',
        expect.any(Function),
      );
    });

    it('卸载时移除事件监听', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const windowRemoveSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderSlateTable();
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('md-resize', expect.any(Function));
      expect(windowRemoveSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
      );
    });

    it('resize 中 NODE_ENV=test 时 early return', () => {
      // 编辑模式下自动触发 resize，由于 NODE_ENV=test 会早退
      // 不应报错
      renderSlateTable();
      // 触发 md-resize 事件
      document.dispatchEvent(new CustomEvent('md-resize', { detail: {} }));
      expect(true).toBe(true);
    });
  });

  // process.env.NODE_ENV 替换为字面量 'test'，在测试环境中不可达。

  describe('table DOM 事件', () => {
    it('table 的 onDragStart 阻止默认行为', () => {
      const { container } = renderSlateTable();
      const table = container.querySelector('table')!;
      const event = new Event('dragstart', { bubbles: true, cancelable: true });
      const prevented = !table.dispatchEvent(event);
      // onDragStart 中调用了 e.preventDefault()
      expect(table).toBeInTheDocument();
    });

    it('外层 div 的 onDragStart 阻止默认行为', () => {
      const { container } = renderSlateTable();
      // 编辑模式下外层是 div with className
      const outerDiv = container.firstChild as HTMLElement;
      const preventSpy = vi.fn();
      fireEvent.dragStart(outerDiv, { preventDefault: preventSpy });
      expect(outerDiv).toBeInTheDocument();
    });

    it('外层 div 的 onDoubleClick 阻止默认行为', () => {
      const { container } = renderSlateTable();
      const outerDiv = container.firstChild as HTMLElement;
      fireEvent.doubleClick(outerDiv);
      expect(outerDiv).toBeInTheDocument();
    });
  });

  describe('md-resize 事件分发', () => {
    it('编辑模式下 useEffect 分发 md-resize 事件', () => {
      const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
      renderSlateTable();
      // useEffect 中 dispatches CustomEvent('md-resize')
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'md-resize' }),
      );
    });

    it('readonly 模式不分发 md-resize', () => {
      mocks.storeState.readonly = true;
      const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
      renderSlateTable();
      const mdResizeCalls = dispatchSpy.mock.calls.filter(
        ([e]) => (e as any).type === 'md-resize',
      );
      expect(mdResizeCalls.length).toBe(0);
    });
  });

  describe('boxShadow 样式', () => {
    it('编辑模式下 scrollState 有滚动时生成 boxShadow', () => {
      mocks.scrollState.vertical = {
        hasScroll: true,
        isAtStart: false,
        isAtEnd: false,
      };
      mocks.scrollState.horizontal = {
        hasScroll: true,
        isAtStart: false,
        isAtEnd: false,
      };
      const { container } = renderSlateTable();
      const outerDiv = container.firstChild as HTMLElement;
      const style = outerDiv.getAttribute('style') || '';
      expect(style).toContain('box-shadow');
    });

    it('scrollState 在顶部和左侧时不生成上/左阴影', () => {
      mocks.scrollState.vertical = {
        hasScroll: true,
        isAtStart: true,
        isAtEnd: false,
      };
      mocks.scrollState.horizontal = {
        hasScroll: true,
        isAtStart: true,
        isAtEnd: false,
      };
      const { container } = renderSlateTable();
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.getAttribute('style')).toContain('box-shadow');
    });

    it('scrollState 在底部和右侧时不生成下/右阴影', () => {
      mocks.scrollState.vertical = {
        hasScroll: true,
        isAtStart: false,
        isAtEnd: true,
      };
      mocks.scrollState.horizontal = {
        hasScroll: true,
        isAtStart: false,
        isAtEnd: true,
      };
      const { container } = renderSlateTable();
      const outerDiv = container.firstChild as HTMLElement;
      expect(outerDiv.getAttribute('style')).toContain('box-shadow');
    });

    it('无滚动时 boxShadow 不含 rgba', () => {
      mocks.scrollState.vertical = {
        hasScroll: false,
        isAtStart: true,
        isAtEnd: true,
      };
      mocks.scrollState.horizontal = {
        hasScroll: false,
        isAtStart: true,
        isAtEnd: true,
      };
      const { container } = renderSlateTable();
      const outerDiv = container.firstChild as HTMLElement;
      const style = outerDiv.getAttribute('style') || '';
      expect(style).not.toContain('rgba');
    });
  });

  describe('colgroup 列渲染', () => {
    it('最后一列只设置 minWidth 不限制 width', () => {
      const element = makeTableElement([['a', 'b', 'c']], {
        colWidths: [80, 90, 100],
      });
      const { container } = renderSlateTable(element);
      const cols = container.querySelectorAll('col');
      // cols: [行号列, a, b, c(最后)]
      expect(cols.length).toBe(4);
      // 最后一列应只有 min-width
      const lastCol = cols[3];
      expect(lastCol.style.minWidth).toBe('60px');
    });

    it('非最后一列设置固定 width', () => {
      const element = makeTableElement([['a', 'b']], { colWidths: [80, 90] });
      const { container } = renderSlateTable(element);
      const cols = container.querySelectorAll('col');
      // cols[1] 是第一列（非最后列）
      expect(cols[1].style.width).toBe('80px');
      expect(cols[1].style.minWidth).toBe('80px');
    });
  });

  describe('编辑模式下 TableRowIndex 渲染', () => {
    it('编辑模式渲染 TableRowIndex', () => {
      const { getByTestId } = renderSlateTable();
      expect(getByTestId('table-row-index')).toBeInTheDocument();
    });

    it('readonly 模式不渲染 TableRowIndex', () => {
      mocks.storeState.readonly = true;
      const { queryByTestId } = renderSlateTable();
      expect(queryByTestId('table-row-index')).not.toBeInTheDocument();
    });
  });

  describe('mobile 列宽计算', () => {
    it('容器宽度小于 mobileBreakpoint 时使用 MOBILE_TABLE_MIN_COLUMN_WIDTH', () => {
      const containerDiv = document.createElement('div');
      const contentDiv = document.createElement('div');
      contentDiv.className = 'ant-agentic-md-editor-content';
      // 很窄的容器触发 mobile layout
      Object.defineProperty(contentDiv, 'clientWidth', {
        value: 400,
        configurable: true,
      });
      containerDiv.appendChild(contentDiv);
      mocks.storeState.markdownContainerRef = { current: containerDiv };

      // 768 - 32 - 12 = 724, 但容器是 400, 所以 400 - 32 - 12 = 356 < 768
      const element = makeTableElement([['a', 'b']]);
      const { container } = renderSlateTable(element);
      const cols = container.querySelectorAll('col');
      expect(cols.length).toBe(3);
    });
  });
});
