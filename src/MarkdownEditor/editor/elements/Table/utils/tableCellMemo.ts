import { RenderElementProps } from 'slate-react';

/** table-cell / header-cell 的 memo 比较：仅 element 与 children 变化时重渲染 */
export function isSameTableCellRenderProps(
  prev: RenderElementProps,
  next: RenderElementProps,
): boolean {
  return prev.element === next.element && prev.children === next.children;
}
