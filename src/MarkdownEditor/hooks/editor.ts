import { useCallback, useRef } from 'react';
import { BaseElement, Editor, Node, Path, Range, Transforms } from 'slate';
import { ReactEditor, useSlateSelector, useSlateStatic } from 'slate-react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { EditorStore, useEditorStore } from '../editor/store';
import { useGetSetState } from '../editor/utils';
import { EditorUtils } from '../editor/utils/editorUtils';
import { useSubject } from './subscribe';

const isSamePath = (a: Path | null, b: Path) => a !== null && Path.equals(a, b);

/** A removed element may still have a queued selector and stale DOM path mapping. */
export const useElementSelected = (element: BaseElement): boolean => {
  const cachedPath = useRef<Path | null>(null);
  const selector = useCallback(
    (editor: Editor) => {
      if (!editor.selection) return false;
      try {
        let path = cachedPath.current;
        if (
          !path ||
          !Editor.hasPath(editor, path) ||
          Node.get(editor, path) !== element
        ) {
          path = ReactEditor.findPath(editor, element);
        }
        if (
          !Editor.hasPath(editor, path) ||
          Node.get(editor, path) !== element
        ) {
          return false;
        }
        cachedPath.current = path;
        return !!Range.intersection(
          Editor.range(editor, path),
          editor.selection,
        );
      } catch {
        return false;
      }
    },
    [element],
  );
  return useSlateSelector(selector, undefined, { deferred: true });
};

/**
 * 自定义钩子 `useMEditor` 用于管理 Slate 编辑器中的节点更新和删除操作。
 *
 * @param el - 基础元素，用于确定操作的目标节点。
 * @returns 包含编辑器实例、更新函数和删除函数的元组。
 *
 * @example
 * ```typescript
 * const [editor, update, remove] = useMEditor(element);
 *
 * // 更新节点属性
 * update({ key: 'value' }, currentElement);
 *
 * // 删除节点
 * remove(currentElement);
 * ```
 *
 * @function
 * @name useMEditor
 * @param {BaseElement} el - 基础元素，用于确定操作的目标节点。
 * @returns {[Editor, (props: Record<string, any>, current?: BaseElement) => void, (current?: BaseElement) => void]}
 *          包含编辑器实例、更新函数和删除函数的元组。
 */
export const useMEditor = (el: BaseElement) => {
  const editor = useSlateStatic();

  const update = useRefFunction(
    (props: Record<string, any>, current?: BaseElement) => {
      Transforms.setNodes(editor, props, {
        at: ReactEditor.findPath(editor, current || el),
      });
    },
  );

  return [editor, update] as [typeof editor, typeof update];
};

/**
 * 自定义 Hook，用于获取编辑器中元素的选中状态和路径。
 *
 * @param element - 需要检查的元素。
 * @returns 一个包含选中状态、路径和编辑器存储的数组。
 *
 * @remarks
 * 该 Hook 使用 `useEditorStore` 获取编辑器存储，并使用 `useGetSetState` 管理组件状态。
 * 它通过 `useSubject` 订阅 `selChange$` 主题，以响应选中状态的变化。
 *
 * @example
 * ```typescript
 * const [isSelected, elementPath, editorStore] = useSelStatus(someElement);
 * ```
 */
export const useSelStatus = (element: any) => {
  const editor = useSlateStatic();
  const { store, markdownEditorRef, selChange$ } = useEditorStore();
  const cachedPath = useRef<Path | null>(null);
  const getElementPath = useCallback(
    (currentEditor: Editor) => {
      const path = cachedPath.current;
      // Text/selection operations preserve paths. Only resolve the DOM mapping
      // again when a structural operation moved this element.
      try {
        if (path && Node.get(currentEditor, path) === element) return path;
      } catch {
        // A removed sibling can make the previously valid path out of bounds.
      }
      cachedPath.current = EditorUtils.findPath(currentEditor, element);
      return cachedPath.current;
    },
    [element],
  );
  // Path updates must also work with FloatBar/selection tracking disabled.
  // Defer until Editable has refreshed Slate's DOM-to-path mappings.
  const elementPath = useSlateSelector(getElementPath, isSamePath, {
    deferred: true,
  });
  const [state, setState] = useGetSetState({
    selected: ReactEditor.isFocused(editor),
  });

  useSubject(
    selChange$,
    (ctx) => {
      const path = getElementPath(markdownEditorRef.current);
      const selected = ctx ? Path.equals(path, ctx.node?.[1] || []) : false;
      if (state().selected === selected) return;
      setState({ selected });
    },
    [element, selChange$, getElementPath],
  );
  return [state().selected, elementPath, store] as [boolean, Path, EditorStore];
};
