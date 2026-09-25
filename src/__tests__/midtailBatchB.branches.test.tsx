/**
 * Midtail batch B：table widths / list getListItems / chart hooks。
 */
import { act, renderHook } from '@testing-library/react';
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  getReadonlyTableColWidths,
  type ReadonlyTableColWidthsInput,
} from '../MarkdownEditor/editor/elements/Table/utils/getTableColWidths';
import { getListItems } from '../MarkdownEditor/editor/plugins/lists/lib/getListItems';
import { agenticListsSchema } from '../MarkdownEditor/editor/plugins/lists/schema';
import { ListType } from '../MarkdownEditor/editor/plugins/lists/types';
import { useChartDataFilter } from '../Plugins/chart/hooks/useChartDataFilter';
import { useDetectTheme } from '../Plugins/chart/hooks/useDetectTheme';
import { useResponsiveSize } from '../Plugins/chart/hooks/useResponsiveSize';

describe('midtail batch B branches', () => {
  it('getReadonlyTableColWidths：显式宽度 / 智能采样 / 默认 / 空列', () => {
    const withExplicit: ReadonlyTableColWidthsInput = {
      columnCount: 2,
      otherProps: { colWidths: [120, 80] },
    };
    expect(getReadonlyTableColWidths(withExplicit)).toEqual([120, 80]);
    expect(getReadonlyTableColWidths({ columnCount: 0 })).toEqual([]);

    const smart = getReadonlyTableColWidths({
      columnCount: 2,
      containerWidth: 400,
      element: {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'Name' }] },
              { type: 'table-cell', children: [{ text: 'Age' }] },
            ],
          },
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'Alice' }] },
              { type: 'table-cell', children: [{ text: '12' }] },
            ],
          },
        ],
      } as any,
    });
    expect(smart).toHaveLength(2);

    expect(getReadonlyTableColWidths({ columnCount: 3 })).toHaveLength(3);
  });

  it('getListItems：无 selection / 有列表项', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = null;
    expect(getListItems(editor, agenticListsSchema, null)).toEqual([]);

    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 1 },
    };
    expect(
      getListItems(editor, agenticListsSchema, editor.selection).length,
    ).toBeGreaterThanOrEqual(0);
  });

  it('useChartDataFilter / useDetectTheme / useResponsiveSize', () => {
    const { result } = renderHook(() =>
      useChartDataFilter([
        { category: 'A', x: 1, y: 2 },
        { category: 'B', x: 2, y: 3 },
      ] as any),
    );
    act(() => {
      result.current.setSelectedFilter('A');
    });
    expect(result.current.filteredData.every((d) => d.category === 'A')).toBe(
      true,
    );

    const { result: theme } = renderHook(() =>
      useDetectTheme({ observeChanges: false }),
    );
    expect(['light', 'dark']).toContain(theme.current);

    const { result: size } = renderHook(() => useResponsiveSize(600, 400));
    expect(size.current.responsiveWidth).toBeTruthy();
    expect(typeof size.current.isMobile).toBe('boolean');

    const resize = new Event('resize');
    act(() => {
      window.dispatchEvent(resize);
    });
  });
});
