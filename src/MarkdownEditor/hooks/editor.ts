import { BaseElement, Path, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import { EditorStore, useEditorStore } from '../editor/store';
import { useGetSetState } from '../editor/utils';
import { EditorUtils } from '../editor/utils/editorUtils';
import { useSubject } from './subscribe';

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
  const editor = useSlate();

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
  const editor = useSlate();
  const { store, markdownEditorRef, selChange$ } = useEditorStore();
  const [state, setState] = useGetSetState({
    selected: ReactEditor.isFocused(editor),
    path: EditorUtils.findPath(editor, element),
  });

  useSubject(
    selChange$,
    (ctx) => {
      const path = EditorUtils.findPath(markdownEditorRef.current, element);
      const selected = ctx
        ? Path.equals(path, ctx.node?.[1] || [])
        : false;
      const prev = state();
      if (
        prev.selected === selected &&
        prev.path.length === path.length &&
        prev.path.every((segment, i) => segment === path[i])
      ) {
        return;
      }
      setState({
        path,
        selected,
      });
    },
    [element],
  );
  return [state().selected, state().path, store] as [
    boolean,
    Path,
    EditorStore,
  ];
};
