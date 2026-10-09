import { useCallback, useRef } from 'react';
import { Editor, Node, Path } from 'slate';
import { useSlateSelector } from 'slate-react';
import { findElementPath } from '../../../utils/findElementPath';

const isSamePath = (a: Path | null | undefined, b: Path | null | undefined) =>
  a === b || (a != null && b != null && Path.equals(a, b));

/**
 * 仅在元素路径改变时更新，不随选区变化重渲染。
 * 用于表格行号/列头等 chrome，避免 useSelStatus / useSlate 导致整表重渲染。
 */
export function useSlateElementPath(element: unknown): number[] | undefined {
  const cachedPath = useRef<Path | undefined>(undefined);
  const getPath = useCallback(
    (editor: Editor) => {
      if (!Node.isNode(element)) return undefined;
      cachedPath.current = findElementPath(editor, element, {
        cachedPath: cachedPath.current,
      });
      return cachedPath.current;
    },
    [element],
  );
  // Structural edits update Slate's maps during Editable's render.
  return useSlateSelector(getPath, isSamePath, { deferred: true });
}
