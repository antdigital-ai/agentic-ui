import { ConfigProvider } from 'antd';
import React, { useContext } from 'react';
import { RenderElementProps } from 'slate-react';
import { useEditorStore } from '../../store';
import type { TableNode } from '../../types/Table';
import { EditableTable } from './EditableTable';
import { ReadonlyTableComponent } from './ReadonlyTableComponent';
import { TablePropsContext } from './TableContext';

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
  if (readonly) {
    return (
      <ReadonlyTableComponent element={props.element} baseCls={baseCls}>
        {children}
      </ReadonlyTableComponent>
    );
  }

  return (
    <EditableTable
      baseCls={baseCls}
      tablePath={tablePath}
      tableNode={props.element as TableNode}
      markdownContainerRef={markdownContainerRef}
      tableCssVariables={tableCssVariables as React.CSSProperties | undefined}
    >
      {children}
    </EditableTable>
  );
};
