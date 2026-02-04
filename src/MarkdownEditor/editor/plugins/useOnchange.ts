/* eslint-disable @typescript-eslint/no-unused-vars */
import { useDebounceFn } from '@ant-design/pro-components';
import React, { useRef } from 'react';
import { Subject } from 'rxjs';
import {
  BaseOperation,
  BaseSelection,
  Editor,
  Element,
  NodeEntry,
  Path,
  Range,
} from 'slate';
import { Elements } from '../../el';
import { useEditorStore } from '../store';
import { parserSlateNodeToMarkdown } from '../utils';

export const selChange$ = new Subject<{
  sel: BaseSelection;
  node: NodeEntry<any>;
} | null>();
const floatBarIgnoreNode = new Set(['code']);

/**
 * 用于处理编辑器内容变化的自定义钩子函数。
 *
 * @param editor - Slate 编辑器实例。
 * @param store - 编辑器状态存储实例。
 * @param onChange - 可选的回调函数，当编辑器内容变化时调用，传递 Markdown 格式的内容和元素数组。
 *
 * @returns 一个函数，用于处理编辑器内容变化。
 */
export function useOnchange(
  editor: Editor,
  onChange?: (value: string, schema: Elements[]) => void,
) {
  const rangeContent = useRef('');
  const onChangeDebounce = useDebounceFn(async () => {
    if (!onChange) return;
    onChange?.(parserSlateNodeToMarkdown(editor.children), editor.children);
  }, 16);

  const { setRefreshFloatBar, setDomRect, refreshFloatBar, readonly } =
    useEditorStore();

  return React.useMemo(() => {
    return (_value: any, _operations: BaseOperation[]) => {
      // 只读且仅选区变化时，跳过 Editor.nodes、selChange$、setDomRect 等，提升性能
      if (readonly && _operations.every((o) => o.type === 'set_selection')) {
        return;
      }
      if (
        onChangeDebounce &&
        _operations.some((o) => o.type !== 'set_selection')
      ) {
        // 如果有 onChange 函数，且操作类型不是 set_selection，则执行 onChangeDebounce
        onChangeDebounce.cancel();
        onChangeDebounce?.run(parserSlateNodeToMarkdown(_value), _value);
      }
      const sel = editor.selection;

      try {
        const [node] = Editor.nodes<Element>(editor, {
          match: (n) => Element.isElement(n),
          mode: 'lowest',
        });
        setTimeout(() => {
          selChange$.next({
            sel,
            node,
          });
        });

        if (!node) return;
        setTimeout(() => {
          selChange$.next({
            sel,
            node,
          });
        });

        if (
          _operations.some((o) => o.type === 'set_selection') &&
          sel &&
          !floatBarIgnoreNode.has(node?.[0]?.type) &&
          !Range.isCollapsed(sel) &&
          Path.equals(Path.parent(sel.focus.path), Path.parent(sel.anchor.path))
        ) {
          if (typeof window === 'undefined') return;
          const domSelection = window.getSelection();
          const domRange = domSelection?.getRangeAt(0);

          if (!domRange?.toString()?.trim()) return;
          if (rangeContent.current === domRange?.toString()) {
            setRefreshFloatBar?.(!refreshFloatBar);
            return;
          }
          rangeContent.current = domRange?.toString() || '';
          const rect = domRange?.getBoundingClientRect();
          if (rect) {
            setDomRect?.(rect);
          } else {
            setDomRect?.(null);
          }
        } else {
          rangeContent.current = '';
          setDomRect?.(null);
        }
      } catch (error) {}
    };
  }, [editor, readonly]);
}
