import { Editor, Range } from 'slate';

/** 读取编辑器首段纯文本，供 IME commit 回退比对 */
export function getEditorTextSnapshot(
  editor: { children: unknown[] } | null | undefined,
): string {
  if (!editor?.children?.length) return '';
  try {
    const paragraph = editor.children[0] as {
      children?: Array<{ text?: string }>;
    };
    return paragraph.children?.map((c) => c.text ?? '').join('') ?? '';
  } catch {
    return '';
  }
}

/** Chrome / Edge：IME 组合期间 keydown 的 keyCode 常为 229 */
export const IME_PROCESSING_KEY_CODE = 229;

/** compositionend 后下一记 Enter 仍视为 IME 确认选字（无固定毫秒窗口） */
let imeEnterCommitGuardPending = false;

export interface ImeKeyboardEventLike {
  key?: string;
  keyCode?: number;
  nativeEvent: { isComposing?: boolean };
}

/**
 * compositionend 后标记：下一记 Enter 多为确认选字，勿触发发送或 / 快捷面板。
 * 仅消费一次；未命中时应在双 rAF 后调用 clearImeEnterCommitGuard 清除。
 */
export function markImeEnterCommitGuard(): void {
  imeEnterCommitGuardPending = true;
}

/** compositionend 双 rAF 后清除未消费的 Enter 守卫 */
export function clearImeEnterCommitGuard(): void {
  imeEnterCommitGuardPending = false;
}

/** 测试用：重置 Enter 守卫 */
export function resetImeEnterCommitGuardForTests(): void {
  imeEnterCommitGuardPending = false;
}

/**
 * 判断键盘事件是否处于 IME 组合态。
 *
 * 中文等输入法用 Enter 确认选字时，部分浏览器在 compositionend 之后、
 * 紧随的 keydown 上 isComposing 已为 false，需结合 store.inputComposition、
 * keyCode 229 与 markImeEnterCommitGuard 窗口。
 */
export function isImeComposing(
  event: ImeKeyboardEventLike,
  inputComposition?: boolean,
): boolean {
  if (inputComposition) return true;
  if (event.nativeEvent?.isComposing) return true;
  if (event.keyCode === IME_PROCESSING_KEY_CODE) return true;
  if (event.key === 'Enter' && imeEnterCommitGuardPending) {
    imeEnterCommitGuardPending = false;
    return true;
  }
  return false;
}

/**
 * 在 compositionend 之后推迟清除 inputComposition，
 * 确保 IME 确认选字的 Enter keydown 仍被识别为组合态。
 */
export function scheduleClearInputComposition(clear: () => void): () => void {
  let cancelled = false;
  const runClear = () => {
    if (!cancelled) clear();
  };

  const requestAnimationFrameFn = globalThis.requestAnimationFrame;

  if (typeof requestAnimationFrameFn === 'function') {
    requestAnimationFrameFn(() => {
      requestAnimationFrameFn(runClear);
    });
  } else {
    setTimeout(runClear, 0);
  }

  return () => {
    cancelled = true;
  };
}

/**
 * Windows Chrome + 中文 IME 全角标点：slate-react 在 compositionend 依赖
 * event.data 写入 Slate；若与 React 渲染竞态导致内容未落盘，在 microtask 中补写。
 * 已写入则跳过，避免重复字符。
 */
export function commitImeCompositionTextIfMissing(
  editor: Editor | null | undefined,
  composedText: string,
  getTextSnapshot: (editor: Editor) => string,
): void {
  if (!editor?.selection || !composedText || !Range.isCollapsed(editor.selection)) {
    return;
  }

  const textBefore = getTextSnapshot(editor);

  queueMicrotask(() => {
    if (!editor.selection || !Range.isCollapsed(editor.selection)) {
      return;
    }

    const textAfter = getTextSnapshot(editor);
    if (textAfter.endsWith(composedText) && textAfter.length >= textBefore.length) {
      return;
    }

    if (textAfter.length === textBefore.length) {
      Editor.insertText(editor, composedText);
    }
  });
}
