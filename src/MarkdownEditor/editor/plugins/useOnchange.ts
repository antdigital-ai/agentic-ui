/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useDebounceFn } from '../../../Hooks/useDebounceFn';
import { useRefFunction } from '../../../Hooks/useRefFunction';
import { Elements } from '../../el';
import { useEditorStore } from '../store';
import { parserSlateNodeToMarkdown } from '../utils';

export const selChange$ = new Subject<{
  sel: BaseSelection;
  node: NodeEntry<any>;
} | null>();
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
 * @param editor - Slate 编辑器实例。
 * @param onChange - 可选的回调函数，当编辑器内容变化时调用，传递 Markdown 格式的内容和元素数组。
 * @param options - 频率调优参数，详见 {@link UseOnchangeOptions}
 */
export function useOnchange(
  editor: Editor,
  onChange?: (value: string, schema: Elements[]) => void,
  options?: UseOnchangeOptions,
) {
  const rangeContent = useRef('');
  const wait = options?.wait ?? DEFAULT_ONCHANGE_DEBOUNCE_WAIT;
  const selectionTrackingEnabled = options?.selectionTrackingEnabled !== false;

  // debounce 内部直接读 editor.children，外部不再做无谓的预序列化。
  const onChangeDebounce = useDebounceFn(async () => {
    if (!onChange) return;
    onChange(
      parserSlateNodeToMarkdown(editor.children),
      editor.children as Elements[],
    );
  }, wait);

  const { setRefreshFloatBar, setDomRect, refreshFloatBar, readonly } =
    useEditorStore();

  // useRefFunction 保证 Slate.onChange 调用时拿到最新闭包；
  // 避免 useMemo 漏依赖（refreshFloatBar / store setter）导致的陈旧值问题。
  return useRefFunction(
    (_value: any, _operations: BaseOperation[]) => {
      const hasContentChange = _operations.some(
        (o) => o.type !== 'set_selection',
      );

      // 早返：只读 + 仅选区变化（旧逻辑保留）
      if (readonly && !hasContentChange) {
        return;
      }

      // 早返：编辑模式仅选区变化 + 不需要选区跟踪 → 跳过 Editor.nodes / selChange$
      if (!hasContentChange && !selectionTrackingEnabled) {
        return;
      }

      // 内容变化才触发用户 onChange
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

        // 只发一次 selChange$（旧版本同 payload 推送两次是 bug）
        setTimeout(() => {
          selChange$.next({
            sel,
            node,
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
    },
  );
}
