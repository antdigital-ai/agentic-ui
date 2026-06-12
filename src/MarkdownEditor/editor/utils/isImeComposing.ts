import { Editor, Range } from 'slate';

/** 读取光标所在文本节点的纯文本，供 IME commit 回退比对 */
export function getEditorTextSnapshot(
  editor: Editor | null | undefined,
): string {
  if (!editor?.selection) return '';
  try {
    return Editor.string(editor, editor.selection.focus.path);
  } catch {
    return '';
  }
}

/** Chrome / Edge：IME 组合期间 keydown 的 keyCode 常为 229 */
export const IME_PROCESSING_KEY_CODE = 229;

/** compositionend 后短暂窗口内，紧随的 Enter 仍视为 IME 确认选字 */
const IME_ENTER_COMMIT_GUARD_MS = 200;

let imeEnterCommitGuardUntil = 0;

export interface ImeKeyboardEventLike {
  key?: string;
  keyCode?: number;
  nativeEvent: { isComposing?: boolean };
}

/**
 * compositionend 后标记：下一记 Enter 多为确认选字，勿触发发送或 / 快捷面板。
 */
export function markImeEnterCommitGuard(): void {
  imeEnterCommitGuardUntil = Date.now() + IME_ENTER_COMMIT_GUARD_MS;
}

/** 测试用：重置 Enter 守卫时间戳 */
export function resetImeEnterCommitGuardForTests(): void {
  imeEnterCommitGuardUntil = 0;
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
  if (event.key === 'Enter' && Date.now() < imeEnterCommitGuardUntil) {
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
