/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useRef } from 'react';
import { BaseOperation, Editor, Element, NodeEntry, Path, Range } from 'slate';
import { useDebounceFn } from '../../../Hooks/useDebounceFn';
import { useRefFunction } from '../../../Hooks/useRefFunction';
import { Elements } from '../../el';
import { useEditorStore } from '../store';
import { getEditorDOMSelection } from '../utils/getEditorDOMSelection';

const floatBarIgnoreNode = new Set(['code']);

const DEFAULT_ONCHANGE_DEBOUNCE_WAIT = 150;

export interface UseOnchangeOptions {
  /** onChange 去抖等待毫秒数，默认 150ms */
  wait?: number;
  /**
   * 是否需要选区跟踪（FloatBar / onSelectionChange）。
   * 关闭时跳过 Editor.nodes / selChange$ / DOMRect 计算，
   * 仅在内容变化时触发 onChange。
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
  const measuredSelection = useRef<Range | null>(null);
  const measuredDocument = useRef<Editor['children'] | null>(null);
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wait = options?.wait ?? DEFAULT_ONCHANGE_DEBOUNCE_WAIT;
  const selectionTrackingEnabled = options?.selectionTrackingEnabled !== false;

  const {
    store,
    setRefreshFloatBar,
    bumpFloatBarRevision,
    setDomRect,
    readonly,
    markdownEditorRef,
    selChange$,
  } = useEditorStore();

  const cancelSelectionNotification = useCallback(() => {
    if (selectionTimer.current !== null) {
      clearTimeout(selectionTimer.current);
      selectionTimer.current = null;
    }
  }, []);

  useEffect(
    () => cancelSelectionNotification,
    [
      cancelSelectionNotification,
      readonly,
      selectionTrackingEnabled,
      selChange$,
    ],
  );

  const onChangeDebounce = useDebounceFn(async () => {
    if (!onChange) return;
    const editor = markdownEditorRef.current;
    if (!editor) return;
    onChange(store.getMDContent(), editor.children as Elements[]);
  }, wait);

  return useRefFunction((_value: any, _operations: BaseOperation[]) => {
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
      cancelSelectionNotification();
      selectionTimer.current = setTimeout(() => {
        selectionTimer.current = null;
        if (markdownEditorRef.current !== editor) return;
        // React may have committed structural changes since this task was
        // queued. Resolve the latest selection and paths together.
        const selection = editor.selection;
        if (!selection) {
          selChange$.next(null);
          return;
        }
        try {
          const [currentNode] = Editor.nodes<Element>(editor, {
            match: (n) => Element.isElement(n),
            mode: 'lowest',
          });
          selChange$.next({
            sel: selection,
            node: currentNode as NodeEntry<Element>,
          });
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('[useOnchange] selection tracking failed:', error);
          }
        }
      }, 0);

      if (
        _operations.some((o) => o.type === 'set_selection') &&
        sel &&
        !Range.isCollapsed(sel) &&
        Path.equals(Path.parent(sel.focus.path), Path.parent(sel.anchor.path))
      ) {
        // Plain typing only needs the coalesced notification above. Resolve a
        // node synchronously only when an expanded selection needs a FloatBar.
        const [node] = Editor.nodes<Element>(editor, {
          match: (n) => Element.isElement(n),
          mode: 'lowest',
        });
        if (!node) return;
        if (floatBarIgnoreNode.has(node[0].type)) {
          rangeContent.current = '';
          measuredSelection.current = null;
          measuredDocument.current = null;
          setDomRect?.(null);
          return;
        }
        if (typeof window === 'undefined') return;
        const domSelection = getEditorDOMSelection(editor);
        if (!domSelection?.rangeCount) {
          rangeContent.current = '';
          measuredSelection.current = null;
          measuredDocument.current = null;
          setDomRect?.(null);
          return;
        }
        const domRange = domSelection.getRangeAt(0);

        const text = domRange?.toString() || '';
        if (!text.trim()) return;
        if (
          rangeContent.current === text &&
          measuredSelection.current &&
          Range.equals(measuredSelection.current, sel) &&
          measuredDocument.current === editor.children
        ) {
          if (bumpFloatBarRevision) {
            bumpFloatBarRevision();
          } else {
            setRefreshFloatBar?.((prev: boolean) => !prev);
          }
          return;
        }
        rangeContent.current = text;
        measuredSelection.current = sel;
        measuredDocument.current = editor.children;
        const rect = domRange?.getBoundingClientRect();
        if (rect) {
          setDomRect?.(rect);
        } else {
          setDomRect?.(null);
        }
      } else {
        rangeContent.current = '';
        measuredSelection.current = null;
        measuredDocument.current = null;
        setDomRect?.(null);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[useOnchange] selection tracking failed:', error);
      }
    }
  });
}
