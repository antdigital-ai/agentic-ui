import { describe, expect, it, vi } from 'vitest';
import { createEditor, Editor, Transforms } from 'slate';
import {
  commitImeCompositionTextIfMissing,
  IME_PROCESSING_KEY_CODE,
  isImeComposing,
  clearImeEnterCommitGuard,
  markImeEnterCommitGuard,
  resetImeEnterCommitGuardForTests,
  scheduleClearInputComposition,
} from '../isImeComposing';

const getSnapshot = (editor: Editor) =>
  Editor.string(editor, editor.selection?.focus.path ?? [0, 0]);

describe('isImeComposing', () => {
  beforeEach(() => {
    resetImeEnterCommitGuardForTests();
  });

  it('inputComposition 为 true 时返回 true', () => {
    expect(isImeComposing({ nativeEvent: { isComposing: false } }, true)).toBe(
      true,
    );
  });

  it('nativeEvent.isComposing 为 true 时返回 true', () => {
    expect(isImeComposing({ nativeEvent: { isComposing: true } }, false)).toBe(
      true,
    );
  });

  it('keyCode 229 时返回 true', () => {
    expect(
      isImeComposing(
        { keyCode: IME_PROCESSING_KEY_CODE, nativeEvent: {} },
        false,
      ),
    ).toBe(true);
  });

  it('普通按键返回 false', () => {
    expect(
      isImeComposing(
        { key: 'a', keyCode: 13, nativeEvent: { isComposing: false } },
        false,
      ),
    ).toBe(false);
  });

  it('compositionend 后下一记 Enter 视为 IME 确认', () => {
    markImeEnterCommitGuard();
    expect(
      isImeComposing(
        { key: 'Enter', nativeEvent: { isComposing: false } },
        false,
      ),
    ).toBe(true);
  });

  it('仅首记 Enter 消费守卫，后续 Enter 不再拦截', () => {
    markImeEnterCommitGuard();
    const enterEvent = {
      key: 'Enter',
      nativeEvent: { isComposing: false },
    };

    expect(isImeComposing(enterEvent, false)).toBe(true);
    expect(isImeComposing(enterEvent, false)).toBe(false);
  });

  it('双 rAF 清除守卫后 Enter 不再视为 IME', async () => {
    const clear = vi.fn();
    markImeEnterCommitGuard();
    await new Promise<void>((resolve) => {
      scheduleClearInputComposition(() => {
        clearImeEnterCommitGuard();
        clear();
        resolve();
      });
    });

    expect(clear).toHaveBeenCalledTimes(1);
    expect(
      isImeComposing(
        { key: 'Enter', nativeEvent: { isComposing: false } },
        false,
      ),
    ).toBe(false);
  });
});

describe('commitImeCompositionTextIfMissing', () => {
  it('Slate 已写入时不重复插入', async () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '，' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 1 });

    commitImeCompositionTextIfMissing(editor, '，', getSnapshot);
    await Promise.resolve();
    expect(getSnapshot(editor)).toBe('，');
  });

  it('compositionend 未落盘时在 microtask 补写', async () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });

    commitImeCompositionTextIfMissing(editor, '，', getSnapshot);
    expect(getSnapshot(editor)).toBe('');
    await Promise.resolve();
    expect(getSnapshot(editor)).toBe('，');
  });
});

describe('scheduleClearInputComposition', () => {
  it('应在双 rAF 后执行 clear', async () => {
    const clear = vi.fn();
    scheduleClearInputComposition(clear);
    expect(clear).not.toHaveBeenCalled();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('cancel 后不应执行 clear', async () => {
    const clear = vi.fn();
    const cancel = scheduleClearInputComposition(clear);
    cancel();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    expect(clear).not.toHaveBeenCalled();
  });
});
