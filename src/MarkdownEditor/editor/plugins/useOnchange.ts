/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef } from 'react';
import {
  BaseOperation,
  Editor,
  Element,
  NodeEntry,
  Path,
  Range,
} from 'slate';
import { useDebounceFn } from '../../../Hooks/useDebounceFn';
import { useRefFunction } from '../../../Hooks/useRefFunction';
import { Elements } from '../../el';
import { useEditorStore } from '../store';
import { parserSlateNodeToMarkdown } from '../utils';

const floatBarIgnoreNode = new Set(['code']);

const DEFAULT_ONCHANGE_DEBOUNCE_WAIT = 150;

export interface UseOnchangeOptions {
  /** onChange 去抖等待毫秒数，默认 150ms */
  wait?: number;
  /**
   * 是否需要选区跟踪（FloatBar / onSelectionChange）。
   * 关闭时仅在内容变化时跑 Editor.nodes / selChange$ / DOMRect 计算，
   * 纯光标移动直接早返。
   */
  selectionTrackingEnabled?: boolean;
}

/**
 * 用于处理编辑器内容变化的自定义钩子函数。
 *
 * @param onChange - 可选的回调函数，当编辑器内容变化时调用，传递 Markdown 格式的内容和元素数组。
 * @param options - 频率调优参数，详见 {@link UseOnchangeOptions}
 */
export function useOnchange(
  onChange?: (value: string, schema: Elements[]) => void,
  options?: UseOnchangeOptions,
) {
  const rangeContent = useRef('');
  const wait = options?.wait ?? DEFAULT_ONCHANGE_DEBOUNCE_WAIT;
  const selectionTrackingEnabled = options?.selectionTrackingEnabled !== false;

  const {
    setRefreshFloatBar,
    bumpFloatBarRevision,
    setDomRect,
    readonly,
    markdownEditorRef,
    selChange$,
  } = useEditorStore();

  const onChangeDebounce = useDebounceFn(async () => {
    if (!onChange) return;
    const editor = markdownEditorRef.current;
    if (!editor) return;
    onChange(
      parserSlateNodeToMarkdown(editor.children),
      editor.children as Elements[],
    );
  }, wait);

  return useRefFunction(
    (_value: any, _operations: BaseOperation[]) => {
      const editor = markdownEditorRef.current;
      if (!editor) return;

      const hasContentChange = _operations.some(
        (o) => o.type !== 'set_selection',
      );

      if (readonly && !hasContentChange) {
        return;
      }

      if (!hasContentChange && !selectionTrackingEnabled) {
        return;
      }

      if (hasContentChange && onChange) {
        onChangeDebounce.run();
      }

      if (!selectionTrackingEnabled) return;

      const sel = editor.selection;

      try {
        const [node] = Editor.nodes<Element>(editor, {
          match: (n) => Element.isElement(n),
          mode: 'lowest',
        });

        setTimeout(() => {
          selChange$.next({
            sel,
            node: node as NodeEntry<any>,
          });
        });

        if (!node) return;

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
            if (bumpFloatBarRevision) {
              bumpFloatBarRevision();
            } else {
              setRefreshFloatBar?.((prev: boolean) => !prev);
            }
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
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[useOnchange] selection tracking failed:', error);
        }
      }
    },
  );
}
