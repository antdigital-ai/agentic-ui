import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { RenderElementProps } from 'slate-react';
import {
  MOBILE_BREAKPOINT,
  MOBILE_TABLE_MIN_COLUMN_WIDTH,
  TABLE_EDIT_COL_WIDTH_MIN_COLUMNS,
} from '../../../../Constants/mobile';
import { useEditorStore } from '../../store';
import type { TableNode } from '../../types/Table';
import { ReadonlyTableComponent } from './ReadonlyTableComponent';
import { TABLE_ROW_INDEX_COL_WIDTH, TableColgroup } from './TableColgroup';
import { TablePropsContext } from './TableContext';
import { TableRowIndex } from './TableRowIndex';
import { getReadonlyTableColWidths } from './utils/getTableColWidths';
import useScrollShadow from './useScrollShadow';

const TABLE_HORIZONTAL_PADDING = 32;
const TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH = 60;
const TABLE_MIN_CONTAINER_WIDTH = 200;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toPixelWidth = (
  width: number | string | undefined,
  containerWidth: number,
  fallbackWidth: number,
): number => {
  if (typeof width === 'number') return width;
  if (!width) return fallbackWidth;

  if (width.endsWith('%')) {
    const ratio = Number.parseFloat(width);
    if (Number.isFinite(ratio)) {
      return (containerWidth * ratio) / 100;
    }
  }

  const parsed = Number.parseFloat(width);
  return Number.isFinite(parsed) ? parsed : fallbackWidth;
};

/**
 * 表格组
 *
 * @param {RenderElementProps} props - 渲染元素的属性。
 *
 * @returns {JSX.Element} 表格组件的 JSX 元素。
 *
 * @component
 *
 * @example
 * ```tsx
 * <Table {...props} />
 * ```
 *
 * @remarks
 * 该组件使用了多个 React 钩子函数，包括 `useState`、`useEffect`、`useCallback` 和 `useRef`。
 *
 * - `useState` 用于管理组件的状态。
 * - `useEffect` 用于处理组件挂载和卸载时的副作用。
 * - `useCallback` 用于优化回调函数的性能。
 * - `useRef` 用于获取 DOM 元素的引用。
 *
 * 组件还使用了 `IntersectionObserver` 来检测表格是否溢出，并相应地添加或移除 CSS 类。
 *
 * @see https://reactjs.org/docs/hooks-intro.html React Hooks
 */
export const SlateTable = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & RenderElementProps) => {
  const { readonly, markdownContainerRef, editorProps } = useEditorStore();
  const tableCssVariables = editorProps?.tableConfig?.cssVariables;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const { tablePath } = useContext(TablePropsContext);

  const baseCls = getPrefixCls('agentic-md-editor-content-table');
  const tableTargetRef = useRef<HTMLTableElement>(null);
  const columnCount = props.element?.children?.[0]?.children?.length || 0;
  const mobileBreakpointValue = parseInt(MOBILE_BREAKPOINT, 10) || 768;
  const [contentWidth, setContentWidth] = useState(0);

  // 总是调用 hooks，避免条件调用
  const [tableRef, scrollState] = useScrollShadow();

  const resolvedContentWidth = useMemo(() => {
    if (contentWidth > 0) return contentWidth;
    return (
      markdownContainerRef?.current?.querySelector('.ant-agentic-md-editor-content')
        ?.clientWidth || 400
    );
  }, [contentWidth, markdownContainerRef]);

  const availableTableWidth = useMemo(
    () =>
      Math.max(
        resolvedContentWidth - TABLE_HORIZONTAL_PADDING - TABLE_ROW_INDEX_COL_WIDTH,
        TABLE_MIN_CONTAINER_WIDTH,
      ),
    [resolvedContentWidth],
  );

  useEffect(() => {
    if (readonly || typeof window === 'undefined') return;

    const contentElement = markdownContainerRef?.current?.querySelector(
      '.ant-agentic-md-editor-content',
    ) as HTMLDivElement | null;

    if (!contentElement) {
      setContentWidth(0);
      return;
    }

    const updateWidth = () => {
      setContentWidth(contentElement.clientWidth || 0);
    };

    if (typeof ResizeObserver === 'undefined') {
      updateWidth();
      return;
    }

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(contentElement);
    updateWidth();

    return () => resizeObserver.disconnect();
  }, [readonly, markdownContainerRef]);

  // 编辑态列宽策略：
  // 1. 优先显式 colWidths；
  // 2. 统一复用只读态宽度算法做内容感知；
  // 3. 结果归一化为 px，避免百分比在编辑态引发抖动。
  const colWidths = useMemo(() => {
    if (readonly) return [];

    // 少于 TABLE_EDIT_COL_WIDTH_MIN_COLUMNS 列不设置 data col，仅行号列（显式 colWidths 也忽略）
    if (columnCount < TABLE_EDIT_COL_WIDTH_MIN_COLUMNS) return [];
    if (!props.element?.children?.length) return [];

    const explicitColWidths = (
      props.element?.otherProps as { colWidths?: Array<number | string> } | undefined
    )?.colWidths;
    if (explicitColWidths?.length) {
      return explicitColWidths
        .slice(0, columnCount)
        .map((width) =>
          Math.max(
            1,
            Math.round(
              toPixelWidth(width, availableTableWidth, TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH),
            ),
          ),
        );
    }

    const isMobileLayout = availableTableWidth <= mobileBreakpointValue;
    const minColumnWidth = isMobileLayout
      ? MOBILE_TABLE_MIN_COLUMN_WIDTH
      : TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH;
    const maxColumnWidth = isMobileLayout
      ? availableTableWidth
      : Math.max(
          TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH,
          availableTableWidth / 4,
        );

    const sourceColWidths = getReadonlyTableColWidths({
      columnCount,
      element: props.element as TableNode,
      containerWidth: availableTableWidth,
    });

    const fallbackWidth = Math.max(
      minColumnWidth,
      Math.floor(availableTableWidth / Math.max(columnCount, 1)),
    );

    const normalizedWidths = Array.from({ length: columnCount }, (_, index) =>
      clamp(
        toPixelWidth(sourceColWidths[index], availableTableWidth, fallbackWidth),
        minColumnWidth,
        maxColumnWidth,
      ),
    );

    const totalWidth = normalizedWidths.reduce((sum, width) => sum + width, 0);
    if (totalWidth > availableTableWidth && columnCount > 0) {
      return Array(columnCount).fill(fallbackWidth);
    }

    return normalizedWidths;
  }, [
    readonly,
    props.element,
    columnCount,
    availableTableWidth,
    mobileBreakpointValue,
  ]);

  // 只在编辑模式下添加resize事件监听
  useEffect(() => {
    if (readonly || typeof window === 'undefined') return;

    const resize = () => {
      if (process.env.NODE_ENV === 'test') return;
      const dom = tableRef.current as HTMLDivElement;
      if (!dom) return;

      const isMobileLayout = availableTableWidth <= mobileBreakpointValue;
      const minColumnWidth = isMobileLayout
        ? MOBILE_TABLE_MIN_COLUMN_WIDTH
        : TABLE_EDIT_DESKTOP_MIN_COLUMN_WIDTH;
      const colWidthsTotal = colWidths.reduce((total, width) => total + width, 0);
      const fallbackMinWidth = Number(
        (Math.max(resolvedContentWidth, TABLE_MIN_CONTAINER_WIDTH) * 0.95).toFixed(
          0,
        ),
      );
      const requiredMinWidth = Math.max(
        columnCount * minColumnWidth,
        colWidthsTotal + TABLE_ROW_INDEX_COL_WIDTH,
        fallbackMinWidth,
        TABLE_MIN_CONTAINER_WIDTH,
      );
      dom.style.minWidth = `${requiredMinWidth}px`;
    };
    document.addEventListener('md-resize', resize);
    window.addEventListener('resize', resize);
    resize();
    return () => {
      document.removeEventListener('md-resize', resize);
      window.removeEventListener('resize', resize);
    };
  }, [
    colWidths,
    readonly,
    tableRef,
    columnCount,
    mobileBreakpointValue,
    availableTableWidth,
    resolvedContentWidth,
  ]);

  useEffect(() => {
    if (readonly) return;
    document.dispatchEvent(
      new CustomEvent('md-resize', {
        detail: {},
      }),
    );
  }, [readonly]);

  // 缓存表格DOM，减少重复渲染
  const tableDom = useMemo(
    () => (
      <table
        ref={tableTargetRef}
        className={classNames(`${baseCls}-editor-table`)}
        onDragStart={(e) => {
          // 阻止拖拽开始事件
          e.preventDefault();
          return false;
        }}
      >
        <TableColgroup
          colWidths={colWidths ?? []}
          prefixColWidth={TABLE_ROW_INDEX_COL_WIDTH}
        />
        <tbody>
          {readonly ? null : (
            <TableRowIndex
              colWidths={colWidths}
              columnCount={columnCount}
              tablePath={tablePath}
            />
          )}
          {children}
        </tbody>
      </table>
    ),
    [colWidths, columnCount, children, baseCls],
  );

  // 缓存boxShadow样式，只在scrollState变化时重新计算
  const boxShadowStyle = useMemo(
    () => ({
      flex: 1,
      minWidth: 0,
      boxShadow: readonly
        ? undefined
        : `
      ${scrollState.vertical.hasScroll && !scrollState.vertical.isAtStart ? 'inset 0 8px 8px -8px rgba(0,0,0,0.1)' : ''}
      ${scrollState.vertical.hasScroll && !scrollState.vertical.isAtEnd ? 'inset 0 -8px 8px -8px rgba(0,0,0,0.1)' : ''}
      ${scrollState.horizontal.hasScroll && !scrollState.horizontal.isAtStart ? 'inset 8px 0 8px -8px rgba(0,0,0,0.1)' : ''}
      ${scrollState.horizontal.hasScroll && !scrollState.horizontal.isAtEnd ? 'inset -8px 0 8px -8px rgba(0,0,0,0.1)' : ''}
    `,
    }),
    [scrollState, readonly],
  );

  // readonly 模式渲染 - 使用优化的组件（早期返回）
  if (readonly) {
    return (
      <ReadonlyTableComponent element={props.element} baseCls={baseCls}>
        {children}
      </ReadonlyTableComponent>
    );
  }

  // 编辑模式渲染
  return (
    <div
      className={classNames(baseCls)}
      ref={tableRef}
      style={{
        ...boxShadowStyle,
        position: 'relative',
        ...(tableCssVariables as React.CSSProperties),
      }}
      onDragStart={(e) => {
        // 阻止拖拽开始时的文字选择
        e.preventDefault();
      }}
      onDoubleClick={(e) => {
        // 阻止双击选择文字
        e.preventDefault();
      }}
    >
      {tableDom}
    </div>
  );
};
