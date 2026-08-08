/**
 * EditableTable deepen residual：scrollShadow 盒影、columnCount 回退、拖拽拦截。
 */
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EditableTable } from '../EditableTable';

const scrollStates = {
  none: {
    vertical: { hasScroll: false, isAtStart: true, isAtEnd: true },
    horizontal: { hasScroll: false, isAtStart: true, isAtEnd: true },
  },
  verticalMid: {
    vertical: { hasScroll: true, isAtStart: false, isAtEnd: false },
    horizontal: { hasScroll: false, isAtStart: true, isAtEnd: true },
  },
  horizontalMid: {
    vertical: { hasScroll: false, isAtStart: true, isAtEnd: true },
    horizontal: { hasScroll: true, isAtStart: false, isAtEnd: false },
  },
  allEdges: {
    vertical: { hasScroll: true, isAtStart: true, isAtEnd: true },
    horizontal: { hasScroll: true, isAtStart: true, isAtEnd: true },
  },
};

let mockScrollState = scrollStates.none;

vi.mock('../useScrollShadow', () => ({
  default: function useScrollShadow() {
    const ref = React.useRef<HTMLDivElement>(null);
    return [ref, mockScrollState] as const;
  },
}));

vi.mock('../utils/useEditableTableContentWidth', () => ({
  useEditableTableContentWidth: () => ({
    resolvedContentWidth: 640,
    availableTableWidth: 480,
  }),
}));

vi.mock('../utils/useEditableTableColWidths', () => ({
  useEditableTableColWidths: () => [120, 120],
}));

vi.mock('../TableColgroup', () => ({
  TABLE_ROW_INDEX_COL_WIDTH: 40,
  TableColgroup: () => <colgroup data-testid="colgroup" />,
}));

vi.mock('../TableRowIndex', () => ({
  TableRowIndex: () => <tr data-testid="row-index" />,
}));

describe('EditableTable deepen residual branches', () => {
  it('无 tableNode 时 columnCount=0 仍可挂载', () => {
    mockScrollState = scrollStates.none;
    const { container } = render(
      <EditableTable baseCls="tbl">
        <tr data-testid="body-row">
          <td>cell</td>
        </tr>
      </EditableTable>,
    );
    expect(container.querySelector('.tbl')).toBeTruthy();
    expect(container.querySelector('[data-testid="body-row"]')).toBeTruthy();
  });

  it('vertical scroll 中间态注入 inset 阴影', () => {
    mockScrollState = scrollStates.verticalMid;
    const { container, rerender } = render(
      <EditableTable
        baseCls="tbl-v"
        tableNode={
          {
            type: 'table',
            children: [{ type: 'table-row', children: [{ type: 'table-cell' }] }],
          } as any
        }
        tableCssVariables={{ '--tbl-w': '100%' } as any}
      >
        <tr>
          <td>x</td>
        </tr>
      </EditableTable>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.boxShadow).toContain('inset 0 8px');

    mockScrollState = scrollStates.horizontalMid;
    rerender(
      <EditableTable baseCls="tbl-h">
        <tr>
          <td>y</td>
        </tr>
      </EditableTable>,
    );
    expect(root.style.boxShadow).toContain('inset 8px 0');
  });

  it('scroll 在起点/终点时不注入对应方向阴影', () => {
    mockScrollState = scrollStates.allEdges;
    const { container } = render(
      <EditableTable baseCls="tbl-edge">
        <tr>
          <td>z</td>
        </tr>
      </EditableTable>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.boxShadow.trim()).toBe('');
  });

  it('onDragStart / onDoubleClick 阻止默认行为', () => {
    mockScrollState = scrollStates.none;
    const { container } = render(
      <EditableTable baseCls="tbl-drag">
        <tr>
          <td>cell</td>
        </tr>
      </EditableTable>,
    );
    const root = container.firstElementChild as HTMLElement;
    const outer = fireEvent.dragStart(root, { cancelable: true });
    expect(outer).toBe(false);

    const table = container.querySelector('table')!;
    const inner = fireEvent.dragStart(table, { cancelable: true });
    expect(inner).toBe(false);

    fireEvent.doubleClick(root, { cancelable: true });
  });

  it('挂载时分发 md-resize 事件', () => {
    const handler = vi.fn();
    document.addEventListener('md-resize', handler);
    mockScrollState = scrollStates.none;
    render(
      <EditableTable baseCls="tbl-resize">
        <tr>
          <td>c</td>
        </tr>
      </EditableTable>,
    );
    expect(handler).toHaveBeenCalled();
    document.removeEventListener('md-resize', handler);
  });
});
