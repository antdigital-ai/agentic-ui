import { useEffect, useRef } from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useRefFunction } from '../../Hooks/useRefFunction';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';

interface UseEditorValueSyncParams {
  value: string | undefined;
  markdownEditorRef: React.MutableRefObject<MarkdownEditorInstance | undefined>;
}

interface UseEditorValueSyncResult {
  /** False while an external replacement is waiting for IME to commit. */
  onEditorChange: (value: string) => boolean;
  onEditorReady: (instance: MarkdownEditorInstance | undefined) => void;
  flushPendingValue: () => void;
}

/** Keep controlled values authoritative without rewriting a live editor echo. */
export const useEditorValueSync = ({
  value,
  markdownEditorRef,
}: UseEditorValueSyncParams): UseEditorValueSyncResult => {
  const lastEditorChangeRef = useRef<{
    value: string;
    children: Editor['children'] | undefined;
  } | null>(null);
  const pendingValueRef = useRef<{ value: string } | null>(null);
  const cancelFlushRef = useRef<(() => void) | null>(null);

  const onEditorChange = useRefFunction((next: string) => {
    // A late composition callback must not overwrite a requested draft/reset.
    if (pendingValueRef.current) return false;
    lastEditorChangeRef.current = {
      value: next,
      children: markdownEditorRef.current?.markdownEditorRef?.current?.children,
    };
    return true;
  });

  const synchronizeValue = useRefFunction(() => {
    // undefined releases control; it is not a request to clear the document.
    if (value === undefined) {
      cancelFlushRef.current?.();
      cancelFlushRef.current = null;
      pendingValueRef.current = null;
      return;
    }

    const instance = markdownEditorRef.current;
    if (!instance) {
      pendingValueRef.current = { value };
      return;
    }
    const slateEditor = instance.markdownEditorRef?.current;
    const lastChange = lastEditorChangeRef.current;
    if (
      lastChange?.value === value &&
      lastChange.children === slateEditor?.children
    ) {
      pendingValueRef.current = null;
      return;
    }

    if (instance.store.getMDContent?.() === value) {
      pendingValueRef.current = null;
      return;
    }

    if (instance.store.inputComposition) {
      pendingValueRef.current = { value };
      return;
    }

    let focused = false;
    if (slateEditor) {
      try {
        focused = ReactEditor.isFocused(slateEditor);
      } catch {
        // The old Slate instance may be unmounting.
      }
    }

    pendingValueRef.current = null;
    lastEditorChangeRef.current = null;
    // EditorStore replaces nodes using safe Slate deselection and avoids native
    // DOM deselection while focused. Never discard a real update due to focus.
    instance.store.setMDContent(value);
    if (focused && slateEditor) {
      try {
        Transforms.select(slateEditor, Editor.end(slateEditor, []));
      } catch {
        // An unmounting editor may no longer contain an editable point.
      }
    }
  });

  const onEditorReady = useRefFunction(
    (instance: MarkdownEditorInstance | undefined) => {
      markdownEditorRef.current = instance;
      if (instance) synchronizeValue();
    },
  );

  const flushPendingValue = useRefFunction(() => {
    if (!pendingValueRef.current) return;
    if (!markdownEditorRef.current?.store.inputComposition) {
      cancelFlushRef.current?.();
      cancelFlushRef.current = null;
      synchronizeValue();
      return;
    }
    if (cancelFlushRef.current) return;

    let frame: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    cancelFlushRef.current = () => {
      cancelled = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (timer !== undefined) clearTimeout(timer);
    };
    const flush = () => {
      if (cancelled) return;
      cancelFlushRef.current = null;
      // Both native compositionend and the editor's IME fallback can request a
      // flush. A later callback must not overwrite input after the first flush.
      if (pendingValueRef.current) synchronizeValue();
    };
    // Slate commits IME text and clears inputComposition over two frames.
    if (typeof requestAnimationFrame === 'function') {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(flush);
      });
    } else {
      timer = setTimeout(flush, 0);
    }
  });

  useEffect(() => {
    synchronizeValue();
  }, [value, synchronizeValue]);

  useEffect(
    () => () => {
      cancelFlushRef.current?.();
      pendingValueRef.current = null;
    },
    [],
  );

  return { onEditorChange, onEditorReady, flushPendingValue };
};
